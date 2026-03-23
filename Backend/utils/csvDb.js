const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const CSV_DIR = path.resolve(__dirname, '../../Databases');

function filePath(table) {
  return path.join(CSV_DIR, `${table}.csv`);
}

function readTable(table) {
  const fp = filePath(table);
  if (!fs.existsSync(fp)) return [];
  const content = fs.readFileSync(fp, 'utf8');
  if (!content.trim()) return [];
  return parse(content, { columns: true, skip_empty_lines: true, trim: true });
}

function writeTable(table, rows) {
  if (!rows || rows.length === 0) return;
  const fp = filePath(table);
  const output = stringify(rows, { header: true });
  fs.writeFileSync(fp, output, 'utf8');
}

function nextId(rows, idField = 'id') {
  if (!rows.length) return 1;
  const max = Math.max(...rows.map(r => parseInt(r[idField]) || 0));
  return max + 1;
}

function findById(table, id, idField) {
  const rows = readTable(table);
  return rows.find(r => String(r[idField]) === String(id)) || null;
}

function insertRow(table, idField, newRow) {
  const rows = readTable(table);
  const id = nextId(rows, idField);
  const row = { [idField]: id, ...newRow, created_at: new Date().toISOString() };
  rows.push(row);
  writeTable(table, rows);
  return row;
}

function updateRow(table, idField, id, updates) {
  const rows = readTable(table);
  const idx = rows.findIndex(r => String(r[idField]) === String(id));
  if (idx === -1) return null;
  rows[idx] = { ...rows[idx], ...updates, updated_at: new Date().toISOString() };
  writeTable(table, rows);
  return rows[idx];
}

module.exports = { readTable, writeTable, nextId, findById, insertRow, updateRow };
