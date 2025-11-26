const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const INPUT_CSV = path.join(__dirname, 'assets', '50_dataset_van_ban_phap_luat.csv');
const OUTPUT_JSON = path.join(__dirname, 'assets', 'legal_documents.json');

const FIELD_MAP = {
  'nghị quyết': 'administrative',
  'quyết định': 'administrative',
  'thông tư': 'commerce',
  'chỉ thị': 'administrative',
};

const seenDocumentIds = new Set();

const buildDocumentId = (row, index) => {
  const candidates = [
    row._id,
    row.so_hieu,
    row.link,
    row.title && `${row.title}-${row.noi_ban_hanh || ''}`,
  ]
    .map((value) => (value ? normalizeWhitespace(String(value)) : null))
    .filter(Boolean);

  candidates.push(`doc-${index}`);

  for (const candidate of candidates) {
    if (!seenDocumentIds.has(candidate)) {
      seenDocumentIds.add(candidate);
      return candidate;
    }
  }

  let suffix = index + 1;
  while (true) {
    const fallbackId = `doc-${suffix++}`;
    if (!seenDocumentIds.has(fallbackId)) {
      seenDocumentIds.add(fallbackId);
      return fallbackId;
    }
  }
};

const normalizeWhitespace = (text = '') =>
  text.replace(/\s+/g, ' ').trim();

const safeParseJSON = (value) => {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    return null;
  }
};

const parseVietnameseDate = (value) => {
  if (!value) return null;

  const trimmed = value.trim();
  const dateParts = trimmed.split(/[\/\-]/);

  if (dateParts.length === 3) {
    const [part1, part2, part3] = dateParts.map((part) => part.padStart(2, '0'));
    if (parseInt(part1, 10) > 12) {
      return `${part3}-${part2}-${part1}`;
    }
    if (parseInt(part1, 10) > 1900) {
      return `${part1}-${part2}-${part3}`;
    }
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const inferField = (type, cleanedContent = '') => {
  const normalizedType = type?.toLowerCase?.() ?? '';
  if (FIELD_MAP[normalizedType]) {
    return FIELD_MAP[normalizedType];
  }

  const content = cleanedContent.toLowerCase();
  if (content.includes('giáo dục')) return 'education';
  if (content.includes('tài chính') || content.includes('ngân sách')) return 'finance';
  if (content.includes('thuế') || content.includes('phí')) return 'tax';
  if (content.includes('đầu tư')) return 'investment';
  if (content.includes('bất động sản')) return 'realestate';
  if (content.includes('thương mại')) return 'commerce';
  if (content.includes('môi trường')) return 'environment';

  return 'administrative';
};

const buildSummary = (row) => {
  const baseText = row.cleaned_content || row.full_text_for_embedding || 'Chưa có nội dung tóm tắt.';
  const normalized = normalizeWhitespace(baseText);
  return normalized.length <= 260 ? normalized : `${normalized.slice(0, 260).trim()}...`;
};

const buildTags = (row, field) => {
  const tags = new Set();
  if (row.loai_van_ban) tags.add(row.loai_van_ban);
  if (row.noi_ban_hanh) tags.add(row.noi_ban_hanh);
  if (field && field !== 'administrative') tags.add(field);
  return Array.from(tags).slice(0, 5);
};

const normalizeStatus = (rawStatus) => {
  if (!rawStatus) return 'Đang cập nhật';
  const normalized = rawStatus.trim();
  const lower = normalized.toLowerCase();
  if (lower.includes('hết hiệu lực')) return 'Hết hiệu lực';
  if (lower.includes('đã biết')) return 'Đã biết';
  if (lower.includes('hiệu lực')) return 'Còn hiệu lực';
  return normalized;
};

const mapRowToDocument = (row, index) => {
  const type = row.loai_van_ban?.trim() || 'Văn bản';
  const field = inferField(type, row.cleaned_content);

  return {
    id: buildDocumentId(row, index),
    title: row.title?.trim() || 'Văn bản pháp luật',
    summary: buildSummary(row),
    type,
    status: normalizeStatus(row.tinh_trang),
    code: row.so_hieu || 'Không rõ',
    province: row.noi_ban_hanh || 'Không rõ cơ quan ban hành',
    issuer: row.nguoi_ky || 'Không rõ người ký',
    date: parseVietnameseDate(row.ngay_ban_hanh) || row.ngay_ban_hanh,
    field,
    tags: buildTags(row, field),
    link: row.link,
  };
};

const main = () => {
  if (!fs.existsSync(INPUT_CSV)) {
    console.error('Không tìm thấy file CSV:', INPUT_CSV);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(INPUT_CSV, 'utf8');
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.errors?.length) {
    console.warn('CSV parse errors:', parsed.errors.slice(0, 3));
  }

  const dataset = parsed.data
    .filter((row) => row && row.title)
    .map((row, index) => mapRowToDocument(row, index));

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(dataset, null, 2), 'utf8');
  console.log(`Đã tạo ${dataset.length} văn bản tại ${OUTPUT_JSON}`);
};

main();

