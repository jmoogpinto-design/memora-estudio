// Gera o "Pix Copia e Cola" (BR Code EMV) — pagamento estático, sem custo.
// Referência: Manual do BR Code do Banco Central.

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export interface PixParams {
  key: string;            // chave Pix (CPF, e-mail, telefone +55..., aleatória)
  merchantName: string;   // nome do recebedor (até 25)
  merchantCity: string;   // cidade (até 15)
  amount?: number;        // valor em reais (opcional)
  txid?: string;          // identificador (até 25, alfanumérico)
  description?: string;   // descrição curta (opcional)
}

export function buildPixPayload(p: PixParams): string {
  const mai = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", p.key) +
    (p.description ? tlv("02", p.description.slice(0, 40)) : "");
  const merchantAccount = tlv("26", mai);
  const txid = (p.txid || "***").replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "***";
  const additional = tlv("62", tlv("05", txid));
  const name = stripAccents(p.merchantName).slice(0, 25);
  const city = stripAccents(p.merchantCity).slice(0, 15);

  let payload =
    tlv("00", "01") +
    tlv("01", "11") + // 11 = pode pagar mais de uma vez (estático)
    merchantAccount +
    tlv("52", "0000") +
    tlv("53", "986") +
    (p.amount && p.amount > 0 ? tlv("54", p.amount.toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    additional;

  payload += "6304";
  return payload + crc16(payload);
}
