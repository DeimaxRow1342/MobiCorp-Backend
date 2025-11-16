import axios from 'axios';
import { htmlToText } from 'html-to-text';
import OpenAI from 'openai';
import pool from '../config/db.js';
import crypto from 'crypto';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function dividirTexto(texto, maxLength = 9000) {
  const bloques = [];
  let i = 0;
  while (i < texto.length) {
    bloques.push(texto.slice(i, i + maxLength));
    i += maxLength;
  }
  return bloques;
}

function extractJSONFromText(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (e) {}
  return { raw: text };
}

export const extractAndSave = async (req, res) => {
  try {
    const { url, category = 'sillas', notes = 'Extracción automática' } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({ success: false, message: 'URL es requerida' });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ success: false, message: 'Falta OPENAI_API_KEY en el backend' });
    }

    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = response.data;

    const htmlLimpio = htmlToText(html, {
      wordwrap: 130,
      selectors: [
        { selector: 'script', format: 'skip' },
        { selector: 'style', format: 'skip' },
        { selector: 'header', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'nav', format: 'skip' },
        { selector: '.ads', format: 'skip' }
      ]
    });

    const bloques = dividirTexto(htmlLimpio, 9000);
    const resultados = [];

    for (const bloque of bloques) {
      const ai = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Eres un extractor técnico. Devuelves JSON verídico solamente.' },
          {
            role: 'user',
            content: `Devuelve un JSON con este formato:\n{\n  "productos": [\n    {"nombre":"...","precio":"... Bs","descripcion":"..."}\n  ]\n}\nSolo sillas de oficina ergonómicas.\n---CONTENIDO---\n${bloque}\n---FIN---`
          }
        ]
      });

      const parsed = extractJSONFromText(ai.choices?.[0]?.message?.content || '');
      resultados.push(parsed);
    }

    // Unificar posibles bloques
    let productos = [];
    for (const r of resultados) {
      if (Array.isArray(r)) {
        productos = productos.concat(r);
      } else if (r && Array.isArray(r.productos)) {
        productos = productos.concat(r.productos);
      }
    }

    const data = productos.length ? { productos } : resultados;
    const totalProducts = productos.length || (Array.isArray(data) ? data.length : 0);

    const [insert] = await pool.execute(
      `INSERT INTO extracted_data (url, data, user_id, category, total_products, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [url, JSON.stringify(data), userId, category, totalProducts, notes]
    );

    const [rows] = await pool.execute(
      `SELECT ed.*, u.username FROM extracted_data ed
       LEFT JOIN users u ON u.id = ed.user_id
       WHERE ed.id = ?`,
      [insert.insertId]
    );

    // Ingestar precios por producto si existen
    const safeGet = (obj, path, dflt=null)=>{
      try{ return path.split('.').reduce((o,k)=>o?.[k], obj) ?? dflt; }catch{ return dflt }
    };
    const slugify = (s)=> (s||'').toString().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,255);
    const parseBs = (txt)=>{
      if(!txt) return null;
      const m = (''+txt).replace(/\./g,'').replace(/,/g,'.').match(/([0-9]+(?:\.[0-9]{1,2})?)/);
      const num = m ? parseFloat(m[1]) : NaN;
      return isNaN(num) ? null : num;
    };

    let productosFromSaved = [];
    const dataObj = rows[0]?.data;
    if(Array.isArray(dataObj)){
      productosFromSaved = dataObj.flatMap(d=>Array.isArray(d?.productos)? d.productos : []).filter(Boolean);
    }else if(dataObj && Array.isArray(dataObj.productos)){
      productosFromSaved = dataObj.productos;
    }

    for(const p of productosFromSaved){
      const name = safeGet(p,'nombre') || safeGet(p,'name');
      const priceTxt = safeGet(p,'precio') || safeGet(p,'price');
      const price = parseBs(priceTxt);
      if(!name || price==null) continue;
      const slug = slugify(name);

      // upsert product
      const [exist] = await pool.execute('SELECT id FROM products WHERE slug = ?', [slug]);
      let productId;
      if(exist.length){
        productId = exist[0].id;
      }else{
        const [insP] = await pool.execute('INSERT INTO products (name, slug) VALUES (?, ?)', [name, slug]);
        productId = insP.insertId;
      }
      await pool.execute(
        'INSERT INTO product_prices (product_id, price_bs, source_url, extracted_data_id) VALUES (?, ?, ?, ?)',
        [productId, price, url, rows[0].id]
      );
    }

    res.status(201).json({ success: true, message: 'Extracción completada y guardada', data: rows[0] });
  } catch (error) {
    const detail = error.response?.data || error.message || 'Error';
    console.error('Error en extracción:', detail);
    const msg = typeof detail === 'string' ? detail : (detail.error?.message || 'Error durante la extracción');
    res.status(500).json({ success: false, message: msg });
  }
};
