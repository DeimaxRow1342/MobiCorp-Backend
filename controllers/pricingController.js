import pool from '../config/db.js'

function normalizePrice(str){
  if (typeof str === 'number') return str
  if (!str) return NaN
  let s = String(str)
  s = s.replace(/\s+/g, '')
  s = s.replace(/\bBs\.?/gi, '')
  s = s.replace(/\bBOB\b/gi, '')
  s = s.replace(/\$/g, '')
  // Puntos como separadores de miles y coma decimal
  // Primero reemplazar puntos de miles
  s = s.replace(/\.(?=\d{3}(\D|$))/g, '')
  // Luego coma por punto
  s = s.replace(/,/g, '.')
  const n = parseFloat(s)
  return isNaN(n) ? NaN : n
}

function collectProductsFromDataRow(row){
  const url = row.url
  const payload = row.data
  let items = []
  try{
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload
    if (Array.isArray(data)){
      // algunos casos guardamos array de bloques
      for (const block of data){
        if (block && Array.isArray(block.productos)){
          for (const p of block.productos){
            items.push({ name: p.nombre || '', price: normalizePrice(p.precio), url })
          }
        }
      }
    } else if (data && Array.isArray(data.productos)){
      for (const p of data.productos){
        items.push({ name: p.nombre || '', price: normalizePrice(p.precio), url })
      }
    }
  }catch(e){
    // ignorar filas mal formateadas
  }
  // Filtrar precios válidos
  items = items.filter(x => Number.isFinite(x.price) && x.price > 0)
  return items
}

function median(nums){
  const arr = nums.filter(n => Number.isFinite(n)).sort((a,b)=>a-b)
  if (arr.length === 0) return null
  const mid = Math.floor(arr.length/2)
  if (arr.length % 2 === 0) return +( (arr[mid-1] + arr[mid]) / 2 ).toFixed(2)
  return +arr[mid].toFixed(2)
}

export const previewPricing = async (req, res) => {
  try{
    const { productName, category = 'sillas' } = req.body
    if (!productName){
      return res.status(400).json({ success:false, message:'productName es requerido' })
    }
    // Traer las últimas N extracciones de la categoría
    const limit = 200
    const [rows] = await pool.execute(
      `SELECT id, url, data, extracted_at FROM extracted_data 
       WHERE category = ? ORDER BY extracted_at DESC LIMIT ?`,
      [category, limit]
    )
    const all = []
    for (const r of rows){
      const items = collectProductsFromDataRow(r)
      for (const it of items){
        if (it.name && it.name.toLowerCase().includes(productName.toLowerCase())){
          all.push({ ...it, extracted_id: r.id })
        }
      }
    }
    const prices = all.map(x=>x.price)
    const med = median(prices)
    const usedUrls = [...new Set(all.map(x=>x.url))]
    return res.json({ success:true, productName, category, sampleCount: all.length, suggestedMedian: med, samples: all, usedUrls })
  }catch(err){
    console.error('previewPricing error:', err.message)
    res.status(500).json({ success:false, message:'Error generando sugerencia' })
  }
}

export const confirmFinalPrice = async (req, res) => {
  try{
    const { productName, imageUrl, category = 'sillas', finalPrice, suggestedMedian, usedUrls = [], samples = [], currency = 'Bs' } = req.body
    if (!productName) return res.status(400).json({ success:false, message:'productName es requerido' })
    if (!finalPrice && finalPrice !== 0) return res.status(400).json({ success:false, message:'finalPrice es requerido' })

    const userId = req.user.id
    const sampleCount = Array.isArray(samples) ? samples.length : 0

    const [ins] = await pool.execute(
      `INSERT INTO final_prices (product_name, image_url, currency, suggested_median, final_price, sample_count, samples, used_urls, category, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [productName, imageUrl || null, currency, suggestedMedian ?? null, finalPrice, sampleCount, JSON.stringify(samples || []), JSON.stringify(usedUrls || []), category, userId]
    )
    const [row] = await pool.execute('SELECT * FROM final_prices WHERE id = ?', [ins.insertId])
    res.status(201).json({ success:true, message:'Precio final guardado', data: row[0] })
  }catch(err){
    console.error('confirmFinalPrice error:', err.message)
    res.status(500).json({ success:false, message:'Error guardando precio final' })
  }
}
