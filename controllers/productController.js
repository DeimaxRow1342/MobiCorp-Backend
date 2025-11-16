import pool from '../config/db.js';

function slugify(name){
  return (name||'')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/(^-|-$)/g,'')
    .slice(0,255);
}

function median(values){
  if(!values || values.length===0) return null;
  const arr = [...values].sort((a,b)=>a-b);
  const mid = Math.floor(arr.length/2);
  if(arr.length % 2) return arr[mid];
  return (arr[mid-1] + arr[mid]) / 2;
}

function quartiles(values){
  if(!values || values.length===0) return {q1:null, q2:null, q3:null};
  const arr=[...values].sort((a,b)=>a-b);
  const q2=median(arr);
  const half = Math.floor(arr.length/2);
  const lower = arr.slice(0, half);
  const upper = arr.length%2 ? arr.slice(half+1) : arr.slice(half);
  const q1=median(lower);
  const q3=median(upper);
  return {q1,q2,q3};
}

export const upsertProduct = async (req,res)=>{
  try{
    const { name, image_url } = req.body;
    if(!name) return res.status(400).json({success:false, message:'name es requerido'});
    const slug = slugify(name);

    const [existing] = await pool.execute('SELECT * FROM products WHERE slug = ?', [slug]);
    let productId;
    if(existing.length){
      productId = existing[0].id;
      if(image_url){
        await pool.execute('UPDATE products SET image_url = ? WHERE id = ?', [image_url, productId]);
      }
    }else{
      const [ins] = await pool.execute(
        'INSERT INTO products (name, slug, image_url) VALUES (?, ?, ?)',
        [name, slug, image_url || null]
      );
      productId = ins.insertId;
    }

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [productId]);
    res.json({success:true, product: rows[0]});
  }catch(err){
    console.error('upsertProduct error:', err.message);
    res.status(500).json({success:false, message:'Error al crear/actualizar producto'});
  }
}

export const listProducts = async (req,res)=>{
  try{
    const [rows] = await pool.execute(
      `SELECT p.*, COUNT(pp.id) as samples
       FROM products p
       LEFT JOIN product_prices pp ON pp.product_id = p.id
       GROUP BY p.id
       ORDER BY p.updated_at DESC, p.created_at DESC`
    );
    res.json({success:true, data: rows});
  }catch(err){
    console.error('listProducts error:', err.message);
    res.status(500).json({success:false, message:'Error al listar productos'});
  }
}

export const getProductDetail = async (req,res)=>{
  try{
    const { id } = req.params;
    const [[productRows], [priceRows]] = await Promise.all([
      pool.execute('SELECT * FROM products WHERE id = ?', [id]),
      pool.execute('SELECT price_bs, source_url, observed_at FROM product_prices WHERE product_id = ? ORDER BY observed_at DESC LIMIT 200', [id])
    ]);
    if(productRows.length===0) return res.status(404).json({success:false, message:'Producto no encontrado'});

    const prices = priceRows.map(r=>Number(r.price_bs));
    const { q1, q2, q3 } = quartiles(prices);
    const min = prices.length? Math.min(...prices): null;
    const max = prices.length? Math.max(...prices): null;

    res.json({
      success:true,
      product: productRows[0],
      stats: {
        count: prices.length,
        min, q1, median: q2, q3, max,
        suggestions: [q1, q2, q3].filter(v=>v!=null)
      },
      prices: priceRows
    });
  }catch(err){
    console.error('getProductDetail error:', err.message);
    res.status(500).json({success:false, message:'Error al obtener producto'});
  }
}

export const setFinalPrice = async (req,res)=>{
  try{
    const { id } = req.params;
    const { final_price } = req.body;
    if(final_price==null || isNaN(Number(final_price))){
      return res.status(400).json({success:false, message:'final_price inválido'});
    }
    await pool.execute('UPDATE products SET final_price = ? WHERE id = ?', [Number(final_price), id]);
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    res.json({success:true, product: rows[0]});
  }catch(err){
    console.error('setFinalPrice error:', err.message);
    res.status(500).json({success:false, message:'Error al guardar precio final'});
  }
}
