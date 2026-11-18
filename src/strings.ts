import * as z from "zod/v4-mini";

export const locStringSchema = z.record(z.string(), z.string()).check(
  z.meta({
    id: "LocString",
    description: 'maps BCP 47 language tag (e.g. "en", "en-US") -> translation',
  }),
);
export type LocString = z.infer<typeof locStringSchema>;

/** pick the most specific translation for the user's preferred locales. i.e. `en-US`, then `en`. default to first locale in object. */
export function localize(
  string: LocString,
  locales: readonly string[] = navigator.languages,
): string {
  for (const tag of locales) {
    const parts = tag.split("-");
    for (let i = parts.length; i > 0; i--) {
      const hit = string[parts.slice(0, i).join("-")];
      if (hit !== undefined) return hit;
    }
  }
  return Object.values(string)[0] ?? "";
}

export const defaultNextString: LocString = {
  en: "next",
  es: "siguiente",
  pt: "próximo",
  fr: "suivant",
  de: "weiter",
  it: "successivo",
  nl: "volgende",
  pl: "następna",
  ru: "следующий",
  uk: "наступний",
  tr: "sonraki",
  ar: "التالي",
  hi: "अगला",
  bn: "পরবর্তী",
  id: "berikutnya",
  vi: "tiếp theo",
  th: "ถัดไป",
  ja: "次へ",
  ko: "다음",
  zh: "下一个",
  "zh-TW": "下一個",
};

export const defaultPrevString: LocString = {
  en: "previous",
  es: "anterior",
  pt: "anterior",
  fr: "précédent",
  de: "zurück",
  it: "precedente",
  nl: "vorige",
  pl: "poprzednia",
  ru: "предыдущий",
  uk: "попередній",
  tr: "önceki",
  ar: "السابق",
  hi: "पिछला",
  bn: "পূর্ববর্তী",
  id: "sebelumnya",
  vi: "trước",
  th: "ก่อนหน้า",
  ja: "前へ",
  ko: "이전",
  zh: "上一个",
  "zh-TW": "上一個",
};

export const defaultRandomString: LocString = {
  en: "random",
  es: "aleatorio",
  pt: "aleatório",
  fr: "aléatoire",
  de: "zufällig",
  it: "casuale",
  nl: "willekeurig",
  pl: "losowa",
  ru: "случайный",
  uk: "випадковий",
  tr: "rastgele",
  ar: "عشوائي",
  hi: "रैंडम",
  bn: "এলোমেলো",
  id: "acak",
  vi: "ngẫu nhiên",
  th: "สุ่ม",
  ja: "ランダム",
  ko: "무작위",
  zh: "随机",
  "zh-TW": "隨機",
};

export const defaultLoadingString: LocString = {
  en: "loading",
  es: "cargando",
  pt: "carregando",
  fr: "chargement",
  de: "lädt",
  it: "caricamento",
  nl: "laden",
  pl: "ładowanie",
  ru: "загрузка",
  uk: "завантаження",
  tr: "yükleniyor",
  ar: "جارٍ التحميل",
  hi: "लोड हो रहा है",
  bn: "লোড হচ্ছে",
  id: "memuat",
  vi: "đang tải",
  th: "กำลังโหลด",
  ja: "読み込み中",
  ko: "로딩 중",
  zh: "加载中",
  "zh-TW": "載入中",
};

export const defaultErrorString: LocString = {
  en: "error",
  es: "error",
  pt: "erro",
  fr: "erreur",
  de: "fehler",
  it: "errore",
  nl: "fout",
  pl: "błąd",
  ru: "ошибка",
  uk: "помилка",
  tr: "hata",
  ar: "خطأ",
  hi: "त्रुटि",
  bn: "ত্রুটি",
  id: "kesalahan",
  vi: "lỗi",
  th: "ข้อผิดพลาด",
  ja: "エラー",
  ko: "오류",
  zh: "错误",
  "zh-TW": "錯誤",
};
