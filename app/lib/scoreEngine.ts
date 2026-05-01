// ─── Atlas Senate Scoring Engine ──────────────────────────────────────────────
// Ported from score_senators.py
// Score per issue = (aligned_weight / total_weight) × 67
// Overall = weighted avg of issue scores × AP-NORC category weights
// Action weights: lead=4, cosponsor=2, committee=2, vote=1, block=4 (always misaligned)

export type ActionType = "lead" | "cosponsor" | "committee" | "vote" | "block";
export type SenatorAction = [
  string,       // senator registry key e.g. "Schumer_NY" or plain "Schumer"
  string,       // AP-NORC category
  string,       // bill id
  ActionType,
  boolean,      // is_aligned
];

export const ACTION_WEIGHTS: Record<ActionType, number> = {
  lead: 4,
  cosponsor: 2,
  committee: 2,
  vote: 1,
  block: 4,
};

// ─── AP-NORC category weights (% worry) ──────────────────────────────────────

export const CAT_WEIGHTS: Record<string, number> = {
  Crime:              12,
  Environment:        12,
  Education:          16,
  "Welfare/Health":    8,
  "Social Security":   7,
  Drugs:               6,
  "Womens Rights":     4,
  "Gun issues":        4,
  Infrastructure:      3,
  Technology:          3,
  Veterans:            2,
  "Economy general":  22,
  Inflation:          17,
  Unemployment:       14,
  Poverty:            14,
  Taxes:              13,
  Deficit:             8,
  Trade:               7,
  Immigration:        44,
  "Personal fin":     18,
  Housing:            17,
  Food:               12,
  "Min wage":          8,
  "Gov corruption":    8,
  "Term limits":       3,
  Freedom:             3,
  Voting:              2,
  Ukraine:             4,
  Israel:              2,
  "FP Overseas":       7,
  "CJ Reform":         3,
  Childcare:           3,
};

// ─── Bill registry (API_BILLS) ────────────────────────────────────────────────

export interface ApiBill {
  congress: number;
  type: string;
  number: number | null;
  category: string;
  is_aligned_if_yea: boolean;
  note?: string;
}

export const API_BILLS: Record<string, ApiBill> = {
  // ── IMMIGRATION ──────────────────────────────────────────────────────────
  laken_riley:      { congress:119, type:"s",     number:5,    category:"Immigration",     is_aligned_if_yea:true  },
  dream_264:        { congress:117, type:"s",     number:264,  category:"Immigration",     is_aligned_if_yea:true  },
  dream_365:        { congress:118, type:"s",     number:365,  category:"Immigration",     is_aligned_if_yea:true  },
  dream_act_25:     { congress:119, type:"s",     number:3348, category:"Immigration",     is_aligned_if_yea:true  },
  citizenship_act:  { congress:117, type:"s",     number:348,  category:"Immigration",     is_aligned_if_yea:true  },
  farm_wf_1045:     { congress:117, type:"s",     number:1045, category:"Immigration",     is_aligned_if_yea:true  },
  stem_1233:        { congress:119, type:"s",     number:1233, category:"Immigration",     is_aligned_if_yea:true  },
  border_s4361:     { congress:118, type:"s",     number:4361, category:"Immigration",     is_aligned_if_yea:true  },

  // ── WELFARE / HEALTHCARE ─────────────────────────────────────────────────
  drug_price_908:   { congress:117, type:"s",     number:908,  category:"Welfare/Health",  is_aligned_if_yea:true  },
  drug_price_833:   { congress:117, type:"s",     number:833,  category:"Welfare/Health",  is_aligned_if_yea:true  },
  ira_drug_pricing: { congress:117, type:"hr",    number:5376, category:"Welfare/Health",  is_aligned_if_yea:true  },
  smart_prices:     { congress:118, type:"s",     number:1246, category:"Welfare/Health",  is_aligned_if_yea:true  },
  mental_parity:    { congress:117, type:"s",     number:1962, category:"Welfare/Health",  is_aligned_if_yea:true  },
  drugsfromcanada:  { congress:119, type:"s",     number:641,  category:"Welfare/Health",  is_aligned_if_yea:true  },
  med_debt:         { congress:118, type:"s",     number:4289, category:"Welfare/Health",  is_aligned_if_yea:true  },
  med_debt_3103:    { congress:118, type:"s",     number:3103, category:"Welfare/Health",  is_aligned_if_yea:true  },
  med_debt_2519:    { congress:119, type:"s",     number:2519, category:"Welfare/Health",  is_aligned_if_yea:true  },
  choose_medicare:  { congress:117, type:"s",     number:386,  category:"Welfare/Health",  is_aligned_if_yea:true  },
  pre_existing:     { congress:119, type:"s",     number:779,  category:"Welfare/Health",  is_aligned_if_yea:true  },
  obbba_medicaid:   { congress:119, type:"hr",    number:1,    category:"Welfare/Health",  is_aligned_if_yea:false },
  obbba_aca:        { congress:119, type:"hr",    number:1,    category:"Welfare/Health",  is_aligned_if_yea:false },
  price_transparency:{ congress:118, type:"s",    number:3548, category:"Welfare/Health",  is_aligned_if_yea:true  },

  // ── SOCIAL SECURITY ──────────────────────────────────────────────────────
  ss_expand_4365:   { congress:117, type:"s",     number:4365, category:"Social Security", is_aligned_if_yea:true  },
  ss_expand_770:    { congress:119, type:"s",     number:770,  category:"Social Security", is_aligned_if_yea:true  },
  ss_fairness:      { congress:118, type:"hr",    number:82,   category:"Social Security", is_aligned_if_yea:true  },
  ss_fair_share:    { congress:118, type:"s",     number:1174, category:"Social Security", is_aligned_if_yea:true  },
  no_tax_ss:        { congress:118, type:"s",     number:2062, category:"Social Security", is_aligned_if_yea:true  },

  // ── ENVIRONMENT / CLIMATE ────────────────────────────────────────────────
  ira_climate:      { congress:117, type:"hr",    number:5376, category:"Environment",     is_aligned_if_yea:true  },
  iija_climate:     { congress:117, type:"hr",    number:3684, category:"Environment",     is_aligned_if_yea:true  },
  public_lands_ren: { congress:118, type:"s",     number:3050, category:"Environment",     is_aligned_if_yea:true  },
  climate_edu:      { congress:117, type:"s",     number:1064, category:"Environment",     is_aligned_if_yea:true  },
  env_justice_919:  { congress:118, type:"s",     number:919,  category:"Environment",     is_aligned_if_yea:true  },
  clean_energy_1298:{ congress:117, type:"s",     number:1298, category:"Environment",     is_aligned_if_yea:true  },
  polluters_pay:    { congress:118, type:"s",     number:5054, category:"Environment",     is_aligned_if_yea:true  },
  weatherize_2418:  { congress:117, type:"s",     number:2418, category:"Environment",     is_aligned_if_yea:true  },
  obbba_climate:    { congress:119, type:"hr",    number:1,    category:"Environment",     is_aligned_if_yea:false },

  // ── FOOD / SNAP ──────────────────────────────────────────────────────────
  school_meals:     { congress:117, type:"s",     number:1568, category:"Food",            is_aligned_if_yea:true  },
  closing_meal_gap: { congress:118, type:"s",     number:2192, category:"Food",            is_aligned_if_yea:true  },
  snap_nutrition:   { congress:118, type:"s",     number:2326, category:"Food",            is_aligned_if_yea:true  },
  obbba_snap:       { congress:119, type:"hr",    number:1,    category:"Food",            is_aligned_if_yea:false },

  // ── GUNS ─────────────────────────────────────────────────────────────────
  bsca:             { congress:117, type:"s",     number:2938, category:"Gun issues",      is_aligned_if_yea:true  },
  bgcks_529:        { congress:117, type:"s",     number:529,  category:"Gun issues",      is_aligned_if_yea:true  },
  bgcks_494:        { congress:118, type:"s",     number:494,  category:"Gun issues",      is_aligned_if_yea:true  },
  bgcks_3214:       { congress:119, type:"s",     number:3214, category:"Gun issues",      is_aligned_if_yea:true  },
  bgcks_3458:       { congress:119, type:"s",     number:3458, category:"Gun issues",      is_aligned_if_yea:true  },
  erpo_292:         { congress:117, type:"s",     number:292,  category:"Gun issues",      is_aligned_if_yea:true  },
  erpo_247:         { congress:118, type:"s",     number:247,  category:"Gun issues",      is_aligned_if_yea:true  },
  ethans_law:       { congress:117, type:"s",     number:1404, category:"Gun issues",      is_aligned_if_yea:true  },
  raise_age_4275:   { congress:117, type:"s",     number:4275, category:"Gun issues",      is_aligned_if_yea:true  },

  // ── GOV CORRUPTION / DEMOCRACY ───────────────────────────────────────────
  disclose:         { congress:117, type:"s",     number:443,  category:"Gov corruption",  is_aligned_if_yea:true  },
  disclose_2939:    { congress:118, type:"s",     number:2939, category:"Gov corruption",  is_aligned_if_yea:true  },
  stock_ban:        { congress:117, type:"s",     number:3494, category:"Gov corruption",  is_aligned_if_yea:true  },
  pelosi_act_58:    { congress:118, type:"s",     number:58,   category:"Gov corruption",  is_aligned_if_yea:true  },
  pelosi_act_693:   { congress:119, type:"s",     number:693,  category:"Gov corruption",  is_aligned_if_yea:true  },
  honest_1498:      { congress:119, type:"s",     number:1498, category:"Gov corruption",  is_aligned_if_yea:true  },
  ethics_1171:      { congress:118, type:"s",     number:1171, category:"Gov corruption",  is_aligned_if_yea:true  },
  scert_act:        { congress:118, type:"s",     number:359,  category:"Gov corruption",  is_aligned_if_yea:true  },
  sc_ethics_2512:   { congress:117, type:"s",     number:2512, category:"Gov corruption",  is_aligned_if_yea:true  },
  sc_ethics_325:    { congress:118, type:"s",     number:325,  category:"Gov corruption",  is_aligned_if_yea:true  },
  sc_term_limits:   { congress:118, type:"s",     number:3096, category:"Gov corruption",  is_aligned_if_yea:true  },
  whistleblower:    { congress:117, type:"s",     number:1524, category:"Gov corruption",  is_aligned_if_yea:true  },

  // ── FREEDOM / SURVEILLANCE ───────────────────────────────────────────────
  press_act:        { congress:118, type:"s",     number:2074, category:"Freedom",         is_aligned_if_yea:true  },
  fisa_reform:      { congress:118, type:"s",     number:3961, category:"Freedom",         is_aligned_if_yea:true  },
  fisa_risaa:       { congress:118, type:"hr",    number:7888, category:"Freedom",         is_aligned_if_yea:false },

  // ── TECHNOLOGY ──────────────────────────────────────────────────────────
  ai_elections:     { congress:118, type:"s",     number:2770, category:"Technology",      is_aligned_if_yea:true  },
  data_priv_4295:   { congress:118, type:"s",     number:4295, category:"Technology",      is_aligned_if_yea:true  },
  net_neutrality:   { congress:117, type:"s",     number:4676, category:"Technology",      is_aligned_if_yea:true  },
  antitrust_online: { congress:117, type:"s",     number:2992, category:"Technology",      is_aligned_if_yea:true  },
  chips_act:        { congress:117, type:"hr",    number:4346, category:"Technology",      is_aligned_if_yea:true  },

  // ── VOTING RIGHTS ────────────────────────────────────────────────────────
  ftv_2747:         { congress:117, type:"s",     number:2747, category:"Voting",          is_aligned_if_yea:true  },
  ftv_1_118:        { congress:118, type:"s",     number:1,    category:"Voting",          is_aligned_if_yea:true  },
  john_lewis_vra:   { congress:118, type:"s",     number:4,    category:"Voting",          is_aligned_if_yea:true  },
  dem_restoration:  { congress:117, type:"s",     number:481,  category:"Voting",          is_aligned_if_yea:true  },
  save_act:         { congress:119, type:"s",     number:128,  category:"Voting",          is_aligned_if_yea:true  },

  // ── TERM LIMITS ──────────────────────────────────────────────────────────
  term_lim_117:     { congress:117, type:"sjres", number:3,    category:"Term limits",     is_aligned_if_yea:true  },
  term_lim_118:     { congress:118, type:"sjres", number:1,    category:"Term limits",     is_aligned_if_yea:true  },
  term_lim_119:     { congress:119, type:"sjres", number:1,    category:"Term limits",     is_aligned_if_yea:true  },

  // ── TAXES ────────────────────────────────────────────────────────────────
  no_tips_tax:      { congress:119, type:"s",     number:129,  category:"Taxes",           is_aligned_if_yea:true  },
  no_overtime_tax:  { congress:119, type:"s",     number:1046, category:"Taxes",           is_aligned_if_yea:true  },
  ira_stock_buyback:{ congress:117, type:"hr",    number:5376, category:"Taxes",           is_aligned_if_yea:true  },
  obbba_buyback_rep:{ congress:119, type:"hr",    number:1,    category:"Taxes",           is_aligned_if_yea:false },
  ctc_expansion:    { congress:117, type:"s",     number:4310, category:"Taxes",           is_aligned_if_yea:true  },
  obbba_deficit:    { congress:119, type:"hr",    number:1,    category:"Deficit",         is_aligned_if_yea:false },

  // ── MIN WAGE / LABOR ─────────────────────────────────────────────────────
  pro_act_567_117:  { congress:117, type:"s",     number:567,  category:"Min wage",        is_aligned_if_yea:true  },
  pro_act_567_118:  { congress:118, type:"s",     number:567,  category:"Min wage",        is_aligned_if_yea:true  },
  pro_act_852:      { congress:119, type:"s",     number:852,  category:"Min wage",        is_aligned_if_yea:true  },
  raise_wage_53:    { congress:117, type:"s",     number:53,   category:"Min wage",        is_aligned_if_yea:true  },
  raise_wage_1332:  { congress:119, type:"s",     number:1332, category:"Min wage",        is_aligned_if_yea:true  },
  apprenticeship:   { congress:118, type:"s",     number:4071, category:"Unemployment",    is_aligned_if_yea:true  },

  // ── EDUCATION ────────────────────────────────────────────────────────────
  pell_grant_2920:  { congress:118, type:"s",     number:2920, category:"Education",       is_aligned_if_yea:true  },
  obbba_loans:      { congress:119, type:"hr",    number:1,    category:"Education",       is_aligned_if_yea:false },

  // ── CRIMINAL JUSTICE ────────────────────────────────────────────────────
  george_floyd:     { congress:117, type:"s",     number:3912, category:"CJ Reform",       is_aligned_if_yea:true  },
  dom_terrorism:    { congress:117, type:"s",     number:963,  category:"CJ Reform",       is_aligned_if_yea:true  },
  cops_reauth:      { congress:117, type:"s",     number:2584, category:"Crime",           is_aligned_if_yea:true  },
  tvpra:            { congress:117, type:"s",     number:920,  category:"Crime",           is_aligned_if_yea:true  },

  // ── WOMENS RIGHTS ────────────────────────────────────────────────────────
  contraception_422:{ congress:118, type:"s",     number:422,  category:"Womens Rights",   is_aligned_if_yea:true  },
  vawa_reauth:      { congress:117, type:"hr",    number:1620, category:"Womens Rights",   is_aligned_if_yea:true  },

  // ── DRUGS ────────────────────────────────────────────────────────────────
  halt_fentanyl:    { congress:119, type:"s",     number:331,  category:"Drugs",           is_aligned_if_yea:true  },

  // ── INFRASTRUCTURE ──────────────────────────────────────────────────────
  iija:             { congress:117, type:"hr",    number:3684, category:"Infrastructure",  is_aligned_if_yea:true  },

  // ── UKRAINE / RUSSIA ─────────────────────────────────────────────────────
  ukraine_aid:      { congress:118, type:"hr",    number:815,  category:"Ukraine",         is_aligned_if_yea:true  },
  russia_sanct:     { congress:119, type:"s",     number:1241, category:"Ukraine",         is_aligned_if_yea:true  },

  // ── ISRAEL / FOREIGN POLICY ──────────────────────────────────────────────
  ceasefire_res:    { congress:118, type:"sjres", number:111,  category:"Israel",          is_aligned_if_yea:true  },
  bulldozer_119:    { congress:119, type:"sjres", number:32,   category:"Israel",          is_aligned_if_yea:true  },
  uflpa:            { congress:117, type:"s",     number:65,   category:"FP Overseas",     is_aligned_if_yea:true  },
  saudi_arms:       { congress:117, type:"sjres", number:31,   category:"FP Overseas",     is_aligned_if_yea:true  },
  ndaa_fy24:        { congress:118, type:"s",     number:2226, category:"FP Overseas",     is_aligned_if_yea:true  },
  sjres37:          { congress:119, type:"sjres", number:37,   category:"Trade",           is_aligned_if_yea:true  },

  // ── VETERANS ────────────────────────────────────────────────────────────
  pact_act:         { congress:117, type:"s",     number:3373, category:"Veterans",        is_aligned_if_yea:true  },

  // ── CHILDCARE ────────────────────────────────────────────────────────────
  childcare_1354:   { congress:117, type:"s",     number:1354, category:"Childcare",       is_aligned_if_yea:true  },
};

// ─── Manual actions (lead sponsors, procedural blocks) ────────────────────────

export const MANUAL_ACTIONS: SenatorAction[] = [
  // ── IMMIGRATION ──────────────────────────────────────────────────────────
  ["Britt_AL",      "Immigration", "laken_riley",    "lead",      true],
  ["Durbin_IL",     "Immigration", "dream_264",      "lead",      true],
  ["Graham_SC",     "Immigration", "dream_264",      "lead",      true],
  ["Durbin_IL",     "Immigration", "dream_365",      "lead",      true],
  ["Graham_SC",     "Immigration", "dream_365",      "lead",      true],
  ["Durbin_IL",     "Immigration", "dream_act_25",   "lead",      true],
  ["Murkowski_AK",  "Immigration", "dream_act_25",   "lead",      true],
  ["Menendez_NJ",   "Immigration", "citizenship_act","lead",      true],
  ["Padilla_CA",    "Immigration", "citizenship_act","lead",      true],
  ["Bennet_CO",     "Immigration", "farm_wf_1045",   "lead",      true],
  ["Crapo_ID",      "Immigration", "farm_wf_1045",   "lead",      true],
  ["Durbin_IL",     "Immigration", "stem_1233",      "lead",      true],
  ["Rounds_SD",     "Immigration", "stem_1233",      "lead",      true],
  ["King_ME",       "Immigration", "stem_1233",      "cosponsor", true],
  ["Lankford_OK",   "Immigration", "border_s4361",   "lead",      true],
  ["Murphy_CT",     "Immigration", "border_s4361",   "lead",      true],
  // ── PERSONAL FINANCE / PAID LEAVE ────────────────────────────────────────
  ["Gillibrand_NY", "Personal fin","family_act_248", "lead",      true],
  ["Gillibrand_NY", "Personal fin","family_act_2823","lead",      true],
  ["Gillibrand_NY", "Personal fin","family_act_1714","lead",      true],
  ["Warren_MA",     "Inflation",   "price_gouge_4214","lead",     true],
  ["Casey_PA",      "Inflation",   "price_gouge_4214","lead",     true],
  ["Warren_MA",     "Inflation",   "price_gouge_3803","lead",     true],
  ["Casey_PA",      "Inflation",   "price_gouge_3803","lead",     true],
  ["Blumenthal_CT", "Personal fin","junk_fees_916",  "lead",      true],
  ["Whitehouse_RI", "Personal fin","junk_fees_916",  "lead",      true],
  ["Tester_MT",     "Personal fin","fair_repair",    "lead",      true],
  ["Wyden_OR",      "Trade",       "sjres37",        "lead",      true],
  ["Grassley_IA",   "Trade",       "sjres37",        "lead",      true],
  // ── HOUSING ──────────────────────────────────────────────────────────────
  ["Schatz_HI",     "Housing",     "road_housing",   "lead",      true],
  ["Cantwell_WA",   "Housing",     "housing_credit", "lead",      true],
  ["Young_IN",      "Housing",     "housing_credit", "lead",      true],
  ["Warnock_GA",    "Housing",     "downpayment",    "lead",      true],
  ["Welch_VT",      "Housing",     "end_homelessness","lead",     true],
  ["Merkley_OR",    "Housing",     "end_hedge_fund", "lead",      true],
  ["Smith_MN",      "Housing",     "end_hedge_fund", "lead",      true],
  ["Young_IN",      "Housing",     "fam_stability_v","lead",      true],
  ["Coons_DE",      "Housing",     "fam_stability_v","lead",      true],
  // ── EDUCATION / CHILDCARE ─────────────────────────────────────────────────
  ["Murray_WA",     "Education",   "pre_k_1573",     "lead",      true],
  ["Murray_WA",     "Education",   "pell_grant_2920","lead",      true],
  ["Murray_WA",     "Childcare",   "childcare_1354", "lead",      true],
  ["Casey_PA",      "Childcare",   "childcare_1354", "lead",      true],
  // ── LABOR / MIN WAGE ─────────────────────────────────────────────────────
  ["Murray_WA",     "Min wage",    "pro_act_567_117","lead",      true],
  ["Sanders_VT",    "Min wage",    "pro_act_567_117","lead",      true],
  ["Murray_WA",     "Min wage",    "pro_act_567_118","lead",      true],
  ["Sanders_VT",    "Min wage",    "pro_act_567_118","lead",      true],
  ["Sanders_VT",    "Min wage",    "pro_act_852",    "lead",      true],
  ["Sanders_VT",    "Min wage",    "raise_wage_53",  "lead",      true],
  ["Murray_WA",     "Min wage",    "raise_wage_53",  "lead",      true],
  ["Sanders_VT",    "Min wage",    "raise_wage_1332","lead",      true],
  ["Sanders_VT",    "Unemployment","apprenticeship", "lead",      true],
  // ── HEALTHCARE ────────────────────────────────────────────────────────────
  ["Kaine_VA",      "Welfare/Health","drug_price_908","lead",     true],
  ["Klobuchar_MN",  "Welfare/Health","drug_price_833","lead",     true],
  ["Wyden_OR",      "Welfare/Health","ira_drug_pricing","lead",   true],
  ["Murray_WA",     "Welfare/Health","ira_drug_pricing","lead",   true],
  ["Wyden_OR",      "Welfare/Health","smart_prices",  "lead",     true],
  ["Murphy_CT",     "Welfare/Health","mental_parity", "lead",     true],
  ["Cassidy_LA",    "Welfare/Health","mental_parity", "lead",     true],
  ["Shaheen_NH",    "Welfare/Health","drugsfromcanada","lead",    true],
  ["Merkley_OR",    "Welfare/Health","med_debt_3103", "lead",     true],
  ["Menendez_NJ",   "Welfare/Health","med_debt_3103", "lead",     true],
  ["Sanders_VT",    "Welfare/Health","med_debt",      "lead",     true],
  ["Merkley_OR",    "Welfare/Health","med_debt",      "lead",     true],
  ["Merkley_OR",    "Welfare/Health","med_debt_2519", "lead",     true],
  ["Merkley_OR",    "Welfare/Health","choose_medicare","lead",    true],
  ["Hassan_NH",     "Welfare/Health","pre_existing",  "lead",     true],
  ["Cassidy_LA",    "Welfare/Health","price_transparency","lead", true],
  ["Hassan_NH",     "Welfare/Health","price_transparency","lead", true],
  // ── SOCIAL SECURITY ───────────────────────────────────────────────────────
  ["Sanders_VT",    "Social Security","ss_expand_4365","lead",    true],
  ["Sanders_VT",    "Social Security","ss_expand_770", "lead",    true],
  ["Brown_OH",      "Social Security","ss_fairness",   "lead",    true],
  ["Collins_ME",    "Social Security","ss_fairness",   "lead",    true],
  ["Whitehouse_RI", "Social Security","ss_fair_share", "lead",    true],
  ["Brown_OH",      "Social Security","no_tax_ss",     "lead",    true],
  // ── ENVIRONMENT ───────────────────────────────────────────────────────────
  ["Heinrich_NM",   "Environment", "public_lands_ren","lead",     true],
  ["Risch_ID",      "Environment", "public_lands_ren","lead",     true],
  ["Markey_MA",     "Environment", "climate_edu",     "lead",     true],
  ["Booker_NJ",     "Environment", "env_justice_919", "lead",     true],
  ["Duckworth_IL",  "Environment", "env_justice_919", "lead",     true],
  ["Wyden_OR",      "Environment", "clean_energy_1298","lead",    true],
  ["Markey_MA",     "Environment", "polluters_pay",   "lead",     true],
  ["Warren_MA",     "Environment", "polluters_pay",   "lead",     true],
  ["Coons_DE",      "Environment", "weatherize_2418", "lead",     true],
  ["Collins_ME",    "Environment", "weatherize_2418", "lead",     true],
  // ── FOOD / SNAP ──────────────────────────────────────────────────────────
  ["Sanders_VT",    "Food",        "school_meals",    "lead",     true],
  ["Gillibrand_NY", "Food",        "school_meals",    "lead",     true],
  ["Gillibrand_NY", "Food",        "closing_meal_gap","lead",     true],
  ["Stabenow_MI",   "Food",        "snap_nutrition",  "lead",     true],
  // ── GUN CONTROL ──────────────────────────────────────────────────────────
  ["Murphy_CT",     "Gun issues",  "bsca",            "lead",     true],
  ["Cornyn_TX",     "Gun issues",  "bsca",            "lead",     true],
  ["Murphy_CT",     "Gun issues",  "bgcks_529",       "lead",     true],
  ["Schumer_NY",    "Gun issues",  "bgcks_529",       "lead",     true],
  ["Blumenthal_CT", "Gun issues",  "bgcks_529",       "lead",     true],
  ["Murphy_CT",     "Gun issues",  "bgcks_494",       "lead",     true],
  ["Murphy_CT",     "Gun issues",  "bgcks_3214",      "lead",     true],
  ["Blumenthal_CT", "Gun issues",  "bgcks_3458",      "lead",     true],
  ["Blumenthal_CT", "Gun issues",  "erpo_292",        "lead",     true],
  ["Graham_SC",     "Gun issues",  "erpo_292",        "lead",     true],
  ["Blumenthal_CT", "Gun issues",  "ethans_law",      "lead",     true],
  ["Murphy_CT",     "Gun issues",  "ethans_law",      "lead",     true],
  ["Feinstein_CA",  "Gun issues",  "erpo_247",        "lead",     true],
  ["Durbin_IL",     "Gun issues",  "raise_age_4275",  "lead",     true],
  // ── GOV CORRUPTION / DEMOCRACY ────────────────────────────────────────────
  ["Whitehouse_RI", "Gov corruption","disclose",      "lead",     true],
  ["Whitehouse_RI", "Gov corruption","disclose_2939", "lead",     true],
  ["McConnell_KY",  "Gov corruption","disclose",      "block",    false],
  ["Ossoff_GA",     "Gov corruption","stock_ban",     "lead",     true],
  ["Sanders_VT",    "Gov corruption","stock_ban",     "cosponsor",true],
  ["Warren_MA",     "Gov corruption","stock_ban",     "cosponsor",true],
  ["Schumer_NY",    "Gov corruption","stock_ban",     "block",    false],
  ["Hawley_MO",     "Gov corruption","pelosi_act_58", "lead",     true],
  ["Hawley_MO",     "Gov corruption","pelosi_act_693","lead",     true],
  ["Hawley_MO",     "Gov corruption","honest_1498",   "lead",     true],
  ["Ossoff_GA",     "Gov corruption","honest_1498",   "lead",     true],
  ["Merkley_OR",    "Gov corruption","ethics_1171",   "lead",     true],
  ["Whitehouse_RI", "Gov corruption","scert_act",     "lead",     true],
  ["Murphy_CT",     "Gov corruption","sc_ethics_2512","lead",     true],
  ["Whitehouse_RI", "Gov corruption","sc_ethics_2512","lead",     true],
  ["King_ME",       "Gov corruption","sc_ethics_325", "lead",     true],
  ["Whitehouse_RI", "Gov corruption","sc_term_limits","lead",     true],
  ["Booker_NJ",     "Gov corruption","sc_term_limits","lead",     true],
  ["Warren_MA",     "Gov corruption","pure_exec",     "lead",     true],
  ["Grassley_IA",   "Gov corruption","whistleblower", "lead",     true],
  // ── FREEDOM / SURVEILLANCE ────────────────────────────────────────────────
  ["Wyden_OR",      "Freedom",     "press_act",       "lead",     true],
  ["Lee_UT",        "Freedom",     "press_act",       "lead",     true],
  ["Wyden_OR",      "Freedom",     "fisa_reform",     "lead",     true],
  ["Lee_UT",        "Freedom",     "fisa_reform",     "lead",     true],
  ["Warner_VA",     "Freedom",     "fisa_risaa",      "lead",     false],
  ["Rubio_FL",      "Freedom",     "fisa_risaa",      "lead",     false],
  // ── TECHNOLOGY ────────────────────────────────────────────────────────────
  ["Klobuchar_MN",  "Technology",  "ai_elections",    "lead",     true],
  ["Hawley_MO",     "Technology",  "ai_elections",    "lead",     true],
  ["Cantwell_WA",   "Technology",  "data_priv_4295",  "lead",     true],
  ["Moran_KS",      "Technology",  "data_priv_4295",  "lead",     true],
  ["Markey_MA",     "Technology",  "net_neutrality",  "lead",     true],
  ["Wyden_OR",      "Technology",  "net_neutrality",  "lead",     true],
  ["Klobuchar_MN",  "Technology",  "antitrust_online","lead",     true],
  ["Grassley_IA",   "Technology",  "antitrust_online","lead",     true],
  ["McConnell_KY",  "Technology",  "antitrust_online","block",    false],
  ["Schumer_NY",    "Technology",  "chips_act",       "lead",     true],
  ["Cornyn_TX",     "Technology",  "chips_act",       "lead",     true],
  ["Schumer_NY",    "Technology",  "bigtech",         "block",    false],
  // ── VOTING RIGHTS ─────────────────────────────────────────────────────────
  ["Klobuchar_MN",  "Voting",      "ftv_2747",        "lead",     true],
  ["Klobuchar_MN",  "Voting",      "ftv_1_118",       "lead",     true],
  ["Durbin_IL",     "Voting",      "john_lewis_vra",  "lead",     true],
  ["Warnock_GA",    "Voting",      "john_lewis_vra",  "lead",     true],
  ["Cardin_MD",     "Voting",      "dem_restoration", "lead",     true],
  // ── TERM LIMITS ──────────────────────────────────────────────────────────
  ["Cruz_TX",       "Term limits", "term_lim_117",    "lead",     true],
  ["Cruz_TX",       "Term limits", "term_lim_118",    "lead",     true],
  ["Cruz_TX",       "Term limits", "term_lim_119",    "lead",     true],
  ["Britt_AL",      "Term limits", "term_lim_119",    "lead",     true],
  // ── TAXES ────────────────────────────────────────────────────────────────
  ["Cruz_TX",       "Taxes",       "no_tips_tax",     "lead",     true],
  ["Rosen_NV",      "Taxes",       "no_tips_tax",     "lead",     true],
  ["Hawley_MO",     "Taxes",       "no_overtime_tax", "lead",     true],
  ["Wyden_OR",      "Taxes",       "ira_stock_buyback","lead",    true],
  ["Brown_OH",      "Taxes",       "ira_stock_buyback","lead",    true],
  ["Wyden_OR",      "Taxes",       "ctc_expansion",   "lead",     true],
  // ── CRIMINAL JUSTICE ─────────────────────────────────────────────────────
  ["Booker_NJ",     "CJ Reform",   "george_floyd",    "lead",     true],
  ["Cornyn_TX",     "CJ Reform",   "de_escalation",   "lead",     true],
  ["Booker_NJ",     "CJ Reform",   "de_escalation",   "lead",     true],
  ["Durbin_IL",     "CJ Reform",   "dom_terrorism",   "lead",     true],
  ["Grassley_IA",   "Crime",       "cops_reauth",     "lead",     true],
  ["Booker_NJ",     "Crime",       "cops_reauth",     "lead",     true],
  ["Cornyn_TX",     "Crime",       "tvpra",           "lead",     true],
  ["Klobuchar_MN",  "Crime",       "tvpra",           "lead",     true],
  // ── WOMENS RIGHTS ─────────────────────────────────────────────────────────
  ["Markey_MA",     "Womens Rights","contraception_422","lead",   true],
  ["Durbin_IL",     "Womens Rights","vawa_reauth",     "lead",    true],
  ["Ernst_IA",      "Womens Rights","vawa_reauth",     "lead",    true],
  // ── DRUGS ────────────────────────────────────────────────────────────────
  ["Schumer_NY",    "Drugs",       "cannabis",        "lead",     true],
  ["Brown_OH",      "Drugs",       "fend_fentanyl",   "lead",     true],
  ["Scott_SC",      "Drugs",       "fend_fentanyl",   "lead",     true],
  ["Cassidy_LA",    "Drugs",       "halt_fentanyl",   "lead",     true],
  // ── INFRASTRUCTURE ───────────────────────────────────────────────────────
  ["Portman_OH",    "Infrastructure","iija",          "lead",     true],
  ["Sinema_AZ",     "Infrastructure","iija",          "lead",     true],
  ["Collins_ME",    "Infrastructure","iija",          "cosponsor",true],
  // ── UKRAINE / RUSSIA ─────────────────────────────────────────────────────
  ["Graham_SC",     "Ukraine",     "russia_sanct",    "lead",     true],
  ["Blumenthal_CT", "Ukraine",     "russia_sanct",    "lead",     true],
  ["McConnell_KY",  "Ukraine",     "russia_sanct",    "block",    false],
  // ── FOREIGN POLICY / OVERSEAS ─────────────────────────────────────────────
  ["Rubio_FL",      "FP Overseas", "uflpa",           "lead",     true],
  ["Merkley_OR",    "FP Overseas", "uflpa",           "lead",     true],
  ["Lee_UT",        "FP Overseas", "saudi_arms",      "lead",     true],
  ["Lee_UT",        "FP Overseas", "yemen_wpr",       "lead",     true],
  ["Murphy_CT",     "FP Overseas", "yemen_wpr",       "lead",     true],
  ["Kaine_VA",      "FP Overseas", "ndaa_fy24",       "lead",     true],
  // ── VETERANS ─────────────────────────────────────────────────────────────
  ["Tester_MT",     "Veterans",    "pact_act",        "lead",     true],
];

// ─── Hardcoded vote/cosponsor actions for the 10 founding senators ─────────────
// These are baked-in for senators where we have confirmed records; all others
// get vote data from the live API.

export const FOUNDING_ACTIONS: SenatorAction[] = [
  // IMMIGRATION
  ["Britt_AL",      "Immigration", "laken_riley",    "vote",      true],
  ["McConnell_KY",  "Immigration", "laken_riley",    "vote",      true],
  ["Cruz_TX",       "Immigration", "laken_riley",    "vote",      true],
  ["Collins_ME",    "Immigration", "laken_riley",    "vote",      true],
  ["Paul_KY",       "Immigration", "laken_riley",    "vote",      true],
  ["Graham_SC",     "Immigration", "laken_riley",    "vote",      true],
  ["Schumer_NY",    "Immigration", "laken_riley",    "vote",      false],
  ["Sanders_VT",    "Immigration", "laken_riley",    "vote",      false],
  ["Warren_MA",     "Immigration", "laken_riley",    "vote",      false],
  ["Gillibrand_NY", "Immigration", "laken_riley",    "vote",      false],
  ["Graham_SC",     "Immigration", "dream_365",      "cosponsor", true],
  ["Schumer_NY",    "Immigration", "dream_365",      "cosponsor", true],
  ["Sanders_VT",    "Immigration", "dream_365",      "cosponsor", true],
  ["Warren_MA",     "Immigration", "dream_365",      "cosponsor", true],
  ["Gillibrand_NY", "Immigration", "dream_365",      "cosponsor", true],
  ["Schumer_NY",    "Immigration", "border_s4361",   "vote",      true],
  ["Sanders_VT",    "Immigration", "border_s4361",   "vote",      true],
  ["Warren_MA",     "Immigration", "border_s4361",   "vote",      true],
  ["Gillibrand_NY", "Immigration", "border_s4361",   "vote",      true],
  ["Collins_ME",    "Immigration", "border_s4361",   "vote",      true],
  ["McConnell_KY",  "Immigration", "border_s4361",   "vote",      false],
  ["Cruz_TX",       "Immigration", "border_s4361",   "vote",      false],
  ["Paul_KY",       "Immigration", "border_s4361",   "vote",      false],
  ["Graham_SC",     "Immigration", "border_s4361",   "vote",      false],
  ["Britt_AL",      "Immigration", "border_s4361",   "vote",      false],
  ["Schumer_NY",    "Immigration", "citizenship_act","cosponsor", true],
  ["Sanders_VT",    "Immigration", "citizenship_act","cosponsor", true],
  ["Warren_MA",     "Immigration", "citizenship_act","cosponsor", true],
  ["Gillibrand_NY", "Immigration", "citizenship_act","cosponsor", true],
  // HEALTHCARE
  ["Schumer_NY",    "Welfare/Health","ira_drug_pricing","cosponsor",true],
  ["Sanders_VT",    "Welfare/Health","ira_drug_pricing","vote",    true],
  ["Warren_MA",     "Welfare/Health","ira_drug_pricing","vote",    true],
  ["Gillibrand_NY", "Welfare/Health","ira_drug_pricing","vote",    true],
  ["McConnell_KY",  "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Cruz_TX",       "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Collins_ME",    "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Graham_SC",     "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Paul_KY",       "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Britt_AL",      "Welfare/Health","ira_drug_pricing","vote",    false],
  ["Paul_KY",       "Welfare/Health","obbba_medicaid", "vote",    true],
  ["Collins_ME",    "Welfare/Health","obbba_medicaid", "vote",    true],
  ["McConnell_KY",  "Welfare/Health","obbba_medicaid", "vote",    false],
  ["Cruz_TX",       "Welfare/Health","obbba_medicaid", "vote",    false],
  ["Graham_SC",     "Welfare/Health","obbba_medicaid", "vote",    false],
  ["Britt_AL",      "Welfare/Health","obbba_medicaid", "vote",    false],
  ["Schumer_NY",    "Welfare/Health","obbba_medicaid", "vote",    true],
  ["Sanders_VT",    "Welfare/Health","obbba_medicaid", "vote",    true],
  ["Warren_MA",     "Welfare/Health","obbba_medicaid", "vote",    true],
  ["Gillibrand_NY", "Welfare/Health","obbba_medicaid", "vote",    true],
  // ENVIRONMENT
  ["Schumer_NY",    "Environment", "ira_climate",    "cosponsor", true],
  ["Sanders_VT",    "Environment", "ira_climate",    "vote",      true],
  ["Warren_MA",     "Environment", "ira_climate",    "vote",      true],
  ["Gillibrand_NY", "Environment", "ira_climate",    "vote",      true],
  ["McConnell_KY",  "Environment", "ira_climate",    "vote",      false],
  ["Cruz_TX",       "Environment", "ira_climate",    "vote",      false],
  ["Collins_ME",    "Environment", "ira_climate",    "vote",      false],
  ["Graham_SC",     "Environment", "ira_climate",    "vote",      false],
  ["Paul_KY",       "Environment", "ira_climate",    "vote",      false],
  ["Britt_AL",      "Environment", "ira_climate",    "vote",      false],
  ["Paul_KY",       "Environment", "obbba_climate",  "vote",      true],
  ["Collins_ME",    "Environment", "obbba_climate",  "vote",      true],
  ["Schumer_NY",    "Environment", "obbba_climate",  "vote",      true],
  ["Sanders_VT",    "Environment", "obbba_climate",  "vote",      true],
  ["Warren_MA",     "Environment", "obbba_climate",  "vote",      true],
  ["Gillibrand_NY", "Environment", "obbba_climate",  "vote",      true],
  ["McConnell_KY",  "Environment", "obbba_climate",  "vote",      false],
  ["Cruz_TX",       "Environment", "obbba_climate",  "vote",      false],
  ["Graham_SC",     "Environment", "obbba_climate",  "vote",      false],
  ["Britt_AL",      "Environment", "obbba_climate",  "vote",      false],
  // GUNS
  ["Collins_ME",    "Gun issues",  "bsca",           "cosponsor", true],
  ["Schumer_NY",    "Gun issues",  "bsca",           "vote",      true],
  ["Sanders_VT",    "Gun issues",  "bsca",           "vote",      true],
  ["Warren_MA",     "Gun issues",  "bsca",           "vote",      true],
  ["Gillibrand_NY", "Gun issues",  "bsca",           "vote",      true],
  ["McConnell_KY",  "Gun issues",  "bsca",           "vote",      true],
  ["Graham_SC",     "Gun issues",  "bsca",           "vote",      true],
  ["Cruz_TX",       "Gun issues",  "bsca",           "vote",      false],
  ["Paul_KY",       "Gun issues",  "bsca",           "vote",      false],
  // SOCIAL SECURITY
  ["Sanders_VT",    "Social Security","ss_expand_4365","lead",    true],
  ["Warren_MA",     "Social Security","ss_expand_4365","cosponsor",true],
  ["Gillibrand_NY", "Social Security","ss_expand_4365","cosponsor",true],
  ["Schumer_NY",    "Social Security","ss_expand_4365","cosponsor",true],
  // DRUGS
  ["Schumer_NY",    "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Sanders_VT",    "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Warren_MA",     "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Collins_ME",    "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Gillibrand_NY", "Drugs",       "fend_fentanyl",  "vote",      true],
  ["McConnell_KY",  "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Cruz_TX",       "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Graham_SC",     "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Paul_KY",       "Drugs",       "fend_fentanyl",  "vote",      true],
  ["Britt_AL",      "Drugs",       "fend_fentanyl",  "vote",      true],
  // VETERANS
  ["Schumer_NY",    "Veterans",    "pact_act",       "vote",      true],
  ["Sanders_VT",    "Veterans",    "pact_act",       "vote",      true],
  ["Warren_MA",     "Veterans",    "pact_act",       "vote",      true],
  ["Collins_ME",    "Veterans",    "pact_act",       "vote",      true],
  ["Gillibrand_NY", "Veterans",    "pact_act",       "vote",      true],
  ["McConnell_KY",  "Veterans",    "pact_act",       "vote",      true],
  ["Cruz_TX",       "Veterans",    "pact_act",       "vote",      true],
  ["Graham_SC",     "Veterans",    "pact_act",       "vote",      true],
  ["Paul_KY",       "Veterans",    "pact_act",       "vote",      false],
  // INFRASTRUCTURE
  ["Schumer_NY",    "Infrastructure","iija",         "vote",      true],
  ["Sanders_VT",    "Infrastructure","iija",         "vote",      true],
  ["Warren_MA",     "Infrastructure","iija",         "vote",      true],
  ["Gillibrand_NY", "Infrastructure","iija",         "vote",      true],
  ["McConnell_KY",  "Infrastructure","iija",         "vote",      true],
  ["Graham_SC",     "Infrastructure","iija",         "vote",      true],
  ["Cruz_TX",       "Infrastructure","iija",         "vote",      false],
  ["Paul_KY",       "Infrastructure","iija",         "vote",      false],
  // TECHNOLOGY
  ["Warren_MA",     "Technology",  "chips_act",      "vote",      true],
  ["Collins_ME",    "Technology",  "chips_act",      "vote",      true],
  ["Gillibrand_NY", "Technology",  "chips_act",      "vote",      true],
  ["McConnell_KY",  "Technology",  "chips_act",      "vote",      true],
  ["Graham_SC",     "Technology",  "chips_act",      "vote",      true],
  ["Cruz_TX",       "Technology",  "chips_act",      "vote",      false],
  ["Paul_KY",       "Technology",  "chips_act",      "vote",      false],
  ["Sanders_VT",    "Technology",  "chips_act",      "vote",      false],
  // TAXES
  ["Schumer_NY",    "Taxes",       "no_tips_tax",    "vote",      true],
  ["Sanders_VT",    "Taxes",       "no_tips_tax",    "vote",      true],
  ["Warren_MA",     "Taxes",       "no_tips_tax",    "vote",      true],
  ["Collins_ME",    "Taxes",       "no_tips_tax",    "vote",      true],
  ["Gillibrand_NY", "Taxes",       "no_tips_tax",    "vote",      true],
  ["McConnell_KY",  "Taxes",       "no_tips_tax",    "vote",      true],
  ["Graham_SC",     "Taxes",       "no_tips_tax",    "vote",      true],
  ["Paul_KY",       "Taxes",       "no_tips_tax",    "vote",      true],
  ["Britt_AL",      "Taxes",       "no_tips_tax",    "vote",      true],
  ["McConnell_KY",  "Taxes",       "no_ot",          "vote",      true],
  ["Cruz_TX",       "Taxes",       "no_ot",          "vote",      true],
  ["Graham_SC",     "Taxes",       "no_ot",          "vote",      true],
  ["Britt_AL",      "Taxes",       "no_ot",          "vote",      true],
  ["Schumer_NY",    "Taxes",       "no_ot",          "vote",      false],
  ["Sanders_VT",    "Taxes",       "no_ot",          "vote",      false],
  ["Warren_MA",     "Taxes",       "no_ot",          "vote",      false],
  ["Gillibrand_NY", "Taxes",       "no_ot",          "vote",      false],
  ["Paul_KY",       "Taxes",       "no_ot",          "vote",      false],
  ["Collins_ME",    "Taxes",       "no_ot",          "vote",      false],
  // DEFICIT
  ["Paul_KY",       "Deficit",     "obbba_deficit",  "vote",      true],
  ["Collins_ME",    "Deficit",     "obbba_deficit",  "vote",      true],
  ["Schumer_NY",    "Deficit",     "obbba_deficit",  "vote",      true],
  ["Sanders_VT",    "Deficit",     "obbba_deficit",  "vote",      true],
  ["Warren_MA",     "Deficit",     "obbba_deficit",  "vote",      true],
  ["Gillibrand_NY", "Deficit",     "obbba_deficit",  "vote",      true],
  ["McConnell_KY",  "Deficit",     "obbba_deficit",  "vote",      false],
  ["Cruz_TX",       "Deficit",     "obbba_deficit",  "vote",      false],
  ["Graham_SC",     "Deficit",     "obbba_deficit",  "vote",      false],
  ["Britt_AL",      "Deficit",     "obbba_deficit",  "vote",      false],
  // FOOD
  ["Paul_KY",       "Food",        "obbba_snap",     "vote",      true],
  ["Collins_ME",    "Food",        "obbba_snap",     "vote",      true],
  ["Schumer_NY",    "Food",        "obbba_snap",     "vote",      true],
  ["Sanders_VT",    "Food",        "obbba_snap",     "vote",      true],
  ["Warren_MA",     "Food",        "obbba_snap",     "vote",      true],
  ["Gillibrand_NY", "Food",        "obbba_snap",     "vote",      true],
  ["McConnell_KY",  "Food",        "obbba_snap",     "vote",      false],
  ["Cruz_TX",       "Food",        "obbba_snap",     "vote",      false],
  ["Graham_SC",     "Food",        "obbba_snap",     "vote",      false],
  ["Britt_AL",      "Food",        "obbba_snap",     "vote",      false],
  // GOV CORRUPTION
  ["Sanders_VT",    "Gov corruption","disclose",     "vote",      true],
  ["Warren_MA",     "Gov corruption","disclose",     "vote",      true],
  ["Gillibrand_NY", "Gov corruption","disclose",     "vote",      true],
  ["McConnell_KY",  "Gov corruption","disclose",     "vote",      false],
  ["Cruz_TX",       "Gov corruption","disclose",     "vote",      false],
  ["Collins_ME",    "Gov corruption","disclose",     "vote",      false],
  ["Graham_SC",     "Gov corruption","disclose",     "vote",      false],
  ["Paul_KY",       "Gov corruption","disclose",     "vote",      false],
  // FREEDOM
  ["Sanders_VT",    "Freedom",     "fisa_risaa",     "vote",      true],
  ["Warren_MA",     "Freedom",     "fisa_risaa",     "vote",      true],
  ["Cruz_TX",       "Freedom",     "fisa_risaa",     "vote",      true],
  ["Paul_KY",       "Freedom",     "fisa_risaa",     "vote",      true],
  ["Schumer_NY",    "Freedom",     "fisa_risaa",     "vote",      false],
  ["McConnell_KY",  "Freedom",     "fisa_risaa",     "vote",      false],
  ["Collins_ME",    "Freedom",     "fisa_risaa",     "vote",      false],
  ["Graham_SC",     "Freedom",     "fisa_risaa",     "vote",      false],
  ["Gillibrand_NY", "Freedom",     "fisa_risaa",     "vote",      false],
  ["Britt_AL",      "Freedom",     "fisa_risaa",     "vote",      false],
  ["Sanders_VT",    "Freedom",     "press_act",      "vote",      true],
  ["Warren_MA",     "Freedom",     "press_act",      "vote",      true],
  ["Cruz_TX",       "Freedom",     "press_act",      "vote",      true],
  ["Paul_KY",       "Freedom",     "press_act",      "vote",      true],
  ["Collins_ME",    "Freedom",     "press_act",      "vote",      true],
  // VOTING
  ["Schumer_NY",    "Voting",      "ftv_2747",       "vote",      true],
  ["Sanders_VT",    "Voting",      "ftv_2747",       "cosponsor", true],
  ["Warren_MA",     "Voting",      "ftv_2747",       "cosponsor", true],
  ["Gillibrand_NY", "Voting",      "ftv_2747",       "cosponsor", true],
  ["McConnell_KY",  "Voting",      "ftv_2747",       "vote",      false],
  ["Cruz_TX",       "Voting",      "ftv_2747",       "vote",      false],
  ["Collins_ME",    "Voting",      "ftv_2747",       "vote",      false],
  ["Paul_KY",       "Voting",      "ftv_2747",       "vote",      false],
  ["Graham_SC",     "Voting",      "ftv_2747",       "vote",      false],
  ["Britt_AL",      "Voting",      "ftv_2747",       "vote",      false],
  ["Paul_KY",       "Voting",      "save_act",       "vote",      true],
  ["Cruz_TX",       "Voting",      "save_act",       "vote",      true],
  ["McConnell_KY",  "Voting",      "save_act",       "vote",      true],
  ["Graham_SC",     "Voting",      "save_act",       "vote",      true],
  ["Britt_AL",      "Voting",      "save_act",       "vote",      true],
  ["Collins_ME",    "Voting",      "save_act",       "vote",      true],
  ["Schumer_NY",    "Voting",      "save_act",       "vote",      false],
  ["Sanders_VT",    "Voting",      "save_act",       "vote",      false],
  ["Warren_MA",     "Voting",      "save_act",       "vote",      false],
  ["Gillibrand_NY", "Voting",      "save_act",       "vote",      false],
  // TERM LIMITS
  ["Paul_KY",       "Term limits", "term_lim_117",   "vote",      true],
  ["Graham_SC",     "Term limits", "term_lim_117",   "vote",      true],
  // TRADE
  ["Schumer_NY",    "Trade",       "sjres37",        "vote",      true],
  ["Sanders_VT",    "Trade",       "sjres37",        "vote",      true],
  ["Warren_MA",     "Trade",       "sjres37",        "vote",      true],
  ["Gillibrand_NY", "Trade",       "sjres37",        "vote",      true],
  ["Paul_KY",       "Trade",       "sjres37",        "vote",      true],
  ["McConnell_KY",  "Trade",       "sjres37",        "vote",      false],
  ["Cruz_TX",       "Trade",       "sjres37",        "vote",      false],
  ["Graham_SC",     "Trade",       "sjres37",        "vote",      false],
  ["Britt_AL",      "Trade",       "sjres37",        "vote",      false],
  ["Collins_ME",    "Trade",       "sjres37",        "vote",      false],
  // UKRAINE
  ["Schumer_NY",    "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Sanders_VT",    "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Warren_MA",     "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Collins_ME",    "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Gillibrand_NY", "Ukraine",     "ukraine_aid",    "vote",      true],
  ["McConnell_KY",  "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Graham_SC",     "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Cruz_TX",       "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Britt_AL",      "Ukraine",     "ukraine_aid",    "vote",      true],
  ["Paul_KY",       "Ukraine",     "ukraine_aid",    "vote",      false],
  ["Schumer_NY",    "Ukraine",     "russia_sanct",   "vote",      true],
  ["Sanders_VT",    "Ukraine",     "russia_sanct",   "vote",      true],
  ["Warren_MA",     "Ukraine",     "russia_sanct",   "vote",      true],
];

// ─── Senator registry key construction ────────────────────────────────────────

export function buildRegistryKey(lastName: string, stateAbbr: string): string {
  // "Van Hollen" → "Van_Hollen", "Hyde-Smith" → "Hyde_Smith"
  const normalized = lastName.replace(/[\s-]/g, "_");
  return `${normalized}_${stateAbbr}`;
}

// ─── Scoring algorithm ────────────────────────────────────────────────────────

export interface SenatorScores {
  byCat: Record<string, number>; // per AP-NORC category, 0–67
  overall: number;               // weighted overall, 0–67
}

export function scoreSenator(
  registryKey: string,
  allActions: SenatorAction[],
): SenatorScores {
  // Step 1: group by (category, bill) — keep highest-weight action per pair
  const best = new Map<string, { weight: number; aligned: boolean }>();

  for (const [key, cat, bill, actionType, aligned] of allActions) {
    if (key !== registryKey) continue;
    const w = ACTION_WEIGHTS[actionType];
    const mapKey = `${cat}||${bill}`;
    const prev = best.get(mapKey);
    if (!prev || w > prev.weight) best.set(mapKey, { weight: w, aligned });
  }

  // Step 2: per-category sums
  const nums: Record<string, number> = {};
  const dens: Record<string, number> = {};
  for (const [mapKey, { weight, aligned }] of best) {
    const cat = mapKey.split("||")[0];
    dens[cat] = (dens[cat] ?? 0) + weight;
    if (aligned) nums[cat] = (nums[cat] ?? 0) + weight;
  }

  // Step 3: issue scores 0–67
  const byCat: Record<string, number> = {};
  for (const cat of Object.keys(dens)) {
    const den = dens[cat];
    const num = nums[cat] ?? 0;
    byCat[cat] = den > 0 ? Math.round((num / den) * 67) : 0;
  }

  // Step 4: weighted overall
  const cats = Object.keys(byCat);
  const totalWeight = cats.reduce((s, c) => s + (CAT_WEIGHTS[c] ?? 1), 0);
  const overall =
    totalWeight > 0
      ? cats.reduce((s, c) => s + byCat[c] * (CAT_WEIGHTS[c] ?? 1), 0) /
        totalWeight
      : 0;

  return { byCat, overall: Math.round(overall * 10) / 10 };
}

// ─── UI category → AP-NORC mapping ───────────────────────────────────────────

export const UI_CATEGORY_MAP: Record<string, Array<[string, number]>> = {
  "war-foreign-policy": [["FP Overseas",7],["Ukraine",4],["Israel",2],["Trade",7]],
  "environment":        [["Environment",12]],
  "healthcare":         [["Welfare/Health",8],["Drugs",6],["Social Security",7],["Childcare",3],["Womens Rights",4]],
  "wealth-gap":         [["Taxes",13],["Min wage",8],["Poverty",14],["Unemployment",14],["Food",12],["Personal fin",18],["Housing",17],["Infrastructure",3],["Education",16],["Inflation",17],["Deficit",8],["Economy general",22]],
  "corruption":         [["Gov corruption",8],["Term limits",3]],
  "civil-liberties":    [["Voting",2],["Freedom",3],["CJ Reform",3],["Crime",12],["Technology",3],["Veterans",2]],
  "gun-policy":         [["Gun issues",4]],
  "immigration":        [["Immigration",44]],
};

export function uiCatScore(uiCatId: string, byCat: Record<string, number>): number {
  const mapping = UI_CATEGORY_MAP[uiCatId] ?? [];
  let wSum = 0, sSum = 0;
  for (const [apCat, w] of mapping) {
    if (byCat[apCat] !== undefined) { sSum += byCat[apCat] * w; wSum += w; }
  }
  return wSum > 0 ? Math.round(sSum / wSum) : 0;
}
