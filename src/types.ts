// 多言語文字列: 文字列そのまま（両言語共通）か {ja, en} オブジェクト
export type L10n = string | { ja: string; en: string };

export type Lang = "ja" | "en";

// 出力ドキュメント種別
//   shokumu   : 職務経歴書（レバテック エンジニア向けフォーマット準拠）
//   rirekisho : 履歴書（レバテック Excel フォーマット準拠）
//   web       : 閲覧用の 1 ページ HTML
export type Doc = "shokumu" | "rirekisho" | "web";

export interface Period {
  from: string; // YYYY-MM
  to?: string; // 省略時は「現在」
}

// S = L10n が YAML 上の型、localize 後は S = string になる
export interface Resume<S = L10n> {
  profile: Profile<S>;
  summary?: S; // 職務要約
  strengths?: S[]; // 得意な分野・知識・技術
  skills: SkillCategory<S>[]; // テクニカルスキル
  workHistory: Company<S>[]; // 開発経歴
  certifications?: { date: string; name: S }[]; // 取得資格等 / 免許・資格
  education?: { date: string; name: S }[]; // 学歴（入学・卒業を 1 行ずつ）
  selfPr?: { title: S; body: S }[]; // 自己PR
  remarks?: S; // 履歴書の備考欄
}

export interface Profile<S = L10n> {
  name: S;
  kana?: S;
  gender?: S;
  birthDate?: string; // YYYY-MM-DD
  postalCode?: string;
  address?: S;
  addressKana?: S;
  phone?: string;
  mobile?: string;
  email?: string;
  github?: string;
  website?: string;
  spouse?: boolean;
  dependents?: number;
  title?: S; // web 用の肩書き
}

export interface Company<S = L10n> {
  name: S;
  period: Period;
  business?: S; // 事業内容
  capital?: S; // 資本金
  employees?: S; // 従業員数
  joinLabel?: S; // 履歴書の職歴行に使う動詞（省略時「入社」/ "Joined"）
  leaveLabel?: S; // 同上（省略時「退社」/ "Left"）
  projects: Project<S>[];
}

export interface Project<S = L10n> {
  title: S;
  period?: Period;
  overview?: S; // プロジェクト概要
  phases?: S[]; // 担当フェーズ
  tasks?: S[]; // 業務内容
  achievements?: S[]; // 実績・取り組み等
  environment?: Environment; // 開発環境
  role?: S;
  teamSize?: number; // チーム人数
  totalSize?: number; // 全体人数
}

export interface Environment {
  os?: string[];
  languages?: string[];
  frameworks?: string[];
  db?: string[];
  other?: string[];
}

export interface SkillCategory<S = L10n> {
  category: S;
  items: { name: string; years?: number; level?: S }[];
}

export type LocalizedResume = Resume<string>;
export type LocalizedCompany = Company<string>;
export type LocalizedProject = Project<string>;
