// Generates simple OmniTrack PWA icons (indigo background, white ring) as PNGs. No dependencies.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
const crc32 = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
    const t = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([len, t, data, crc]);
};

// ringScale: outer radius of the ring as a fraction of the size (smaller for maskable safe zone)
function png(size, ringScale, outPath) {
    const bg = [79, 70, 229]; // indigo-600
    const outer = (size / 2) * ringScale;
    const inner = outer * 0.62;
    const c = size / 2;
    const raw = Buffer.alloc((size * 4 + 1) * size);
    for (let y = 0; y < size; y++) {
        raw[y * (size * 4 + 1)] = 0;
        for (let x = 0; x < size; x++) {
            const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
            // 1px anti-aliased ring coverage
            const cov = Math.max(0, Math.min(1, outer - d + 0.5)) * Math.max(0, Math.min(1, d - inner + 0.5));
            const o = y * (size * 4 + 1) + 1 + x * 4;
            for (let i = 0; i < 3; i++) raw[o + i] = Math.round(bg[i] + (255 - bg[i]) * cov);
            raw[o + 3] = 255;
        }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(size, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    writeFileSync(
        outPath,
        Buffer.concat([
            Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
            chunk("IHDR", ihdr),
            chunk("IDAT", deflateSync(raw)),
            chunk("IEND", Buffer.alloc(0)),
        ]),
    );
}

const dir = "src/app/webapp/pwa/public/icons";
png(192, 0.62, `${dir}/icon-192.png`);
png(512, 0.62, `${dir}/icon-512.png`);
png(512, 0.45, `${dir}/icon-maskable-512.png`);
png(180, 0.62, `${dir}/apple-touch-icon.png`);
