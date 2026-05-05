// ─── Atlas Senate Scoring Engine ──────────────────────────────────────────────
// Ported from score_senators.py (ground truth)
// Score per issue = (aligned_weight / total_weight) × 67
// Overall = weighted avg of issue scores × AP-NORC category weights
// Action weights: lead=4, cosponsor=2, committee=2, vote=1, block=4

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

// ─── AP-NORC category weights (12 categories, Dec 2025) ──────────────────────
// Source: AP-NORC PROB1 n=1,146 MoE±4.0pp fielded 12/4–12/8/2025

export const CAT_WEIGHTS: Record<string, number> = {
  Housing:           52,   // inflation 17 + personal financial 18 + housing 17
  Immigration:       44,
  Economy:           44,   // economy 36 + wages 8
  Healthcare:        40,
  Government:        37,   // politics/AI/privacy/voting/surveillance
  FP:                26,   // foreign policy (Ukraine, Israel, arms, war powers)
  Deficit:           19,   // deficit 8 + corruption 8 + term limits 3
  Hunger:            19,   // poverty/hunger 14 + veterans 2 + food/SNAP + vulnerable 3
  Crime:             16,   // crime 12 + gun violence 4
  Environment:       15,
  "Social Security":  7,
  Drugs:              7,
};

// ─── Bill registry (API_BILLS) ────────────────────────────────────────────────

export interface ApiBill {
  congress: number;
  type: string;
  number: number | null;
  category: string;
  is_aligned_if_yea: boolean;
  reference_only?: boolean;
  note?: string;
}

export const API_BILLS: Record<string, ApiBill> = {
  // ── IMMIGRATION ──────────────────────────────────────────────────────────
  laken_riley:       { congress:119, type:"s",     number:5,    category:"Immigration",    is_aligned_if_yea:true,  reference_only:true  },
  border_s4361:      { congress:118, type:"s",     number:4361, category:"Immigration",    is_aligned_if_yea:true   },
  obbba_border:      { congress:119, type:"hr",    number:1,    category:"Immigration",    is_aligned_if_yea:true   },
  dream_264:         { congress:117, type:"s",     number:264,  category:"Immigration",    is_aligned_if_yea:true   },
  dream_365:         { congress:118, type:"s",     number:365,  category:"Immigration",    is_aligned_if_yea:true   },
  dream_act_25:      { congress:119, type:"s",     number:3348, category:"Immigration",    is_aligned_if_yea:true   },
  citizenship_act:   { congress:117, type:"s",     number:348,  category:"Immigration",    is_aligned_if_yea:true   },
  farm_wf_1045:      { congress:117, type:"s",     number:1045, category:"Immigration",    is_aligned_if_yea:true   },
  stem_1233:         { congress:119, type:"s",     number:1233, category:"Immigration",    is_aligned_if_yea:true   },
  everify_118:       { congress:118, type:"s",     number:156,  category:"Immigration",    is_aligned_if_yea:true   },
  everify_119:       { congress:119, type:"s",     number:1151, category:"Immigration",    is_aligned_if_yea:true   },

  // ── HOUSING / PERSONAL FINANCE ──────────────────────────────────────────
  family_act_248:    { congress:117, type:"s",     number:248,  category:"Housing",        is_aligned_if_yea:true   },
  family_act_2823:   { congress:117, type:"s",     number:2823, category:"Housing",        is_aligned_if_yea:true   },
  family_act_1714:   { congress:118, type:"s",     number:1714, category:"Housing",        is_aligned_if_yea:true   },
  price_gouge_4214:  { congress:117, type:"s",     number:4214, category:"Housing",        is_aligned_if_yea:true   },
  price_gouge_3803:  { congress:118, type:"s",     number:3803, category:"Housing",        is_aligned_if_yea:true   },
  junk_fees_916:     { congress:118, type:"s",     number:916,  category:"Housing",        is_aligned_if_yea:true   },
  fair_repair:       { congress:117, type:"s",     number:3568, category:"Housing",        is_aligned_if_yea:true   },
  road_housing:      { congress:119, type:"s",     number:null, category:"Housing",        is_aligned_if_yea:true   },
  housing_credit:    { congress:118, type:"s",     number:933,  category:"Housing",        is_aligned_if_yea:true   },
  downpayment:       { congress:117, type:"s",     number:5202, category:"Housing",        is_aligned_if_yea:true   },
  end_homelessness:  { congress:117, type:"s",     number:3424, category:"Housing",        is_aligned_if_yea:true   },
  end_hedge_fund:    { congress:118, type:"s",     number:3402, category:"Housing",        is_aligned_if_yea:true   },
  fam_stability_v:   { congress:118, type:"s",     number:1257, category:"Housing",        is_aligned_if_yea:true   },

  // ── ECONOMY / LABOR / EDUCATION ─────────────────────────────────────────
  sjres37:           { congress:119, type:"sjres", number:37,   category:"Economy",        is_aligned_if_yea:true   },
  pre_k_1573:        { congress:117, type:"s",     number:1573, category:"Economy",        is_aligned_if_yea:true   },
  pell_grant_2920:   { congress:118, type:"s",     number:2920, category:"Economy",        is_aligned_if_yea:true   },
  obbba_loans:       { congress:119, type:"hr",    number:1,    category:"Economy",        is_aligned_if_yea:false  },
  pro_act_420:       { congress:117, type:"s",     number:420,  category:"Economy",        is_aligned_if_yea:true   },
  pro_act_567_117:   { congress:117, type:"s",     number:567,  category:"Economy",        is_aligned_if_yea:true   },
  pro_act_567_118:   { congress:118, type:"s",     number:567,  category:"Economy",        is_aligned_if_yea:true   },
  pro_act_852:       { congress:119, type:"s",     number:852,  category:"Economy",        is_aligned_if_yea:true   },
  raise_wage_53:     { congress:117, type:"s",     number:53,   category:"Economy",        is_aligned_if_yea:true   },
  raise_wage_2488:   { congress:117, type:"s",     number:2488, category:"Economy",        is_aligned_if_yea:true   },
  raise_wage_1332:   { congress:119, type:"s",     number:1332, category:"Economy",        is_aligned_if_yea:true   },
  apprenticeship:    { congress:118, type:"s",     number:4071, category:"Economy",        is_aligned_if_yea:true   },
  amer_energy_wkr:   { congress:117, type:"s",     number:4906, category:"Economy",        is_aligned_if_yea:true   },
  childcare_1354:    { congress:117, type:"s",     number:1354, category:"Economy",        is_aligned_if_yea:true   },
  iija:              { congress:117, type:"hr",    number:3684, category:"Economy",        is_aligned_if_yea:true   },
  no_tips_tax:       { congress:119, type:"s",     number:129,  category:"Economy",        is_aligned_if_yea:true   },
  no_overtime_tax:   { congress:119, type:"s",     number:1046, category:"Economy",        is_aligned_if_yea:true   },
  ira_stock_buyback: { congress:117, type:"hr",    number:5376, category:"Economy",        is_aligned_if_yea:true   },
  ctc_expansion:     { congress:117, type:"s",     number:4310, category:"Economy",        is_aligned_if_yea:true   },
  obbba_ctc:         { congress:119, type:"hr",    number:1,    category:"Economy",        is_aligned_if_yea:true   },

  // ── HEALTHCARE ──────────────────────────────────────────────────────────
  drug_price_908:    { congress:117, type:"s",     number:908,  category:"Healthcare",     is_aligned_if_yea:true   },
  drug_price_833:    { congress:117, type:"s",     number:833,  category:"Healthcare",     is_aligned_if_yea:true   },
  ira_drug_pricing:  { congress:117, type:"hr",    number:5376, category:"Healthcare",     is_aligned_if_yea:true   },
  smart_prices:      { congress:118, type:"s",     number:1246, category:"Healthcare",     is_aligned_if_yea:true   },
  mental_parity:     { congress:117, type:"s",     number:1962, category:"Healthcare",     is_aligned_if_yea:true   },
  drugsfromcanada:   { congress:119, type:"s",     number:641,  category:"Healthcare",     is_aligned_if_yea:true   },
  med_debt:          { congress:118, type:"s",     number:4289, category:"Healthcare",     is_aligned_if_yea:true   },
  med_debt_3103:     { congress:118, type:"s",     number:3103, category:"Healthcare",     is_aligned_if_yea:true   },
  med_debt_2519:     { congress:119, type:"s",     number:2519, category:"Healthcare",     is_aligned_if_yea:true   },
  choose_medicare:   { congress:117, type:"s",     number:386,  category:"Healthcare",     is_aligned_if_yea:true   },
  pre_existing:      { congress:119, type:"s",     number:779,  category:"Healthcare",     is_aligned_if_yea:true   },
  obbba_medicaid:    { congress:119, type:"hr",    number:1,    category:"Healthcare",     is_aligned_if_yea:false  },
  obbba_aca:         { congress:119, type:"hr",    number:1,    category:"Healthcare",     is_aligned_if_yea:false  },
  price_transparency:{ congress:118, type:"s",     number:3548, category:"Healthcare",     is_aligned_if_yea:true   },
  contraception_4557:{ congress:117, type:"s",     number:4557, category:"Healthcare",     is_aligned_if_yea:true   },
  contraception_422: { congress:118, type:"s",     number:422,  category:"Healthcare",     is_aligned_if_yea:true   },
  vawa_reauth:       { congress:117, type:"hr",    number:1620, category:"Healthcare",     is_aligned_if_yea:true   },

  // ── SOCIAL SECURITY ──────────────────────────────────────────────────────
  ss_expand_4365:    { congress:117, type:"s",     number:4365, category:"Social Security", is_aligned_if_yea:true  },
  ss_expand_770:     { congress:119, type:"s",     number:770,  category:"Social Security", is_aligned_if_yea:true  },
  ss_fairness:       { congress:118, type:"hr",    number:82,   category:"Social Security", is_aligned_if_yea:true  },
  ss_fair_share:     { congress:118, type:"s",     number:1174, category:"Social Security", is_aligned_if_yea:true  },
  no_tax_ss:         { congress:118, type:"s",     number:2062, category:"Social Security", is_aligned_if_yea:true  },
  ss_protect_3177:   { congress:117, type:"s",     number:3177, category:"Social Security", is_aligned_if_yea:true  },
  safeguard_ss:      { congress:117, type:"s",     number:3462, category:"Social Security", is_aligned_if_yea:true  },
  ss_2100:           { congress:117, type:"s",     number:3071, category:"Social Security", is_aligned_if_yea:true  },
  obbba_ss:          { congress:119, type:"hr",    number:1,    category:"Social Security", is_aligned_if_yea:true  },

  // ── ENVIRONMENT ──────────────────────────────────────────────────────────
  ira_climate:       { congress:117, type:"hr",    number:5376, category:"Environment",    is_aligned_if_yea:true   },
  iija_climate:      { congress:117, type:"hr",    number:3684, category:"Environment",    is_aligned_if_yea:true   },
  public_lands_ren:  { congress:118, type:"s",     number:3050, category:"Environment",    is_aligned_if_yea:true   },
  climate_edu:       { congress:117, type:"s",     number:1064, category:"Environment",    is_aligned_if_yea:true   },
  env_justice_919:   { congress:118, type:"s",     number:919,  category:"Environment",    is_aligned_if_yea:true   },
  clean_energy_1298: { congress:117, type:"s",     number:1298, category:"Environment",    is_aligned_if_yea:true   },
  polluters_pay:     { congress:118, type:"s",     number:5054, category:"Environment",    is_aligned_if_yea:true   },
  weatherize_2418:   { congress:117, type:"s",     number:2418, category:"Environment",    is_aligned_if_yea:true   },
  growing_climate:   { congress:117, type:"s",     number:1251, category:"Environment",    is_aligned_if_yea:true   },
  americas_clean:    { congress:117, type:"s",     number:685,  category:"Environment",    is_aligned_if_yea:true   },
  save_our_future:   { congress:118, type:"s",     number:4787, category:"Environment",    is_aligned_if_yea:true   },
  heat_illness:      { congress:118, type:"s",     number:2501, category:"Environment",    is_aligned_if_yea:true   },
  foreign_poll_fee:  { congress:118, type:"s",     number:3198, category:"Environment",    is_aligned_if_yea:true   },
  obbba_climate:     { congress:119, type:"hr",    number:1,    category:"Environment",    is_aligned_if_yea:false  },
  obbba_ev:          { congress:119, type:"hr",    number:1,    category:"Environment",    is_aligned_if_yea:false  },
  obbba_methane:     { congress:119, type:"hr",    number:1,    category:"Environment",    is_aligned_if_yea:false  },

  // ── HUNGER / FOOD / VETERANS ─────────────────────────────────────────────
  school_meals:      { congress:117, type:"s",     number:1568, category:"Hunger",         is_aligned_if_yea:true   },
  closing_meal_gap:  { congress:118, type:"s",     number:2192, category:"Hunger",         is_aligned_if_yea:true   },
  snap_nutrition:    { congress:118, type:"s",     number:2326, category:"Hunger",         is_aligned_if_yea:true   },
  obbba_snap:        { congress:119, type:"hr",    number:1,    category:"Hunger",         is_aligned_if_yea:false  },
  pact_act:          { congress:117, type:"s",     number:3373, category:"Hunger",         is_aligned_if_yea:true   },
  veterans_home:     { congress:117, type:"s",     number:2867, category:"Hunger",         is_aligned_if_yea:true   },

  // ── CRIME / GUNS ─────────────────────────────────────────────────────────
  bsca:              { congress:117, type:"s",     number:2938, category:"Crime",          is_aligned_if_yea:true   },
  bgcks_529:         { congress:117, type:"s",     number:529,  category:"Crime",          is_aligned_if_yea:true   },
  bgcks_494:         { congress:118, type:"s",     number:494,  category:"Crime",          is_aligned_if_yea:true   },
  bgcks_3214:        { congress:119, type:"s",     number:3214, category:"Crime",          is_aligned_if_yea:true   },
  bgcks_3458:        { congress:119, type:"s",     number:3458, category:"Crime",          is_aligned_if_yea:true   },
  erpo_292:          { congress:117, type:"s",     number:292,  category:"Crime",          is_aligned_if_yea:true   },
  erpo_1819:         { congress:117, type:"s",     number:1819, category:"Crime",          is_aligned_if_yea:true   },
  erpo_247:          { congress:118, type:"s",     number:247,  category:"Crime",          is_aligned_if_yea:true   },
  ethans_law:        { congress:117, type:"s",     number:1404, category:"Crime",          is_aligned_if_yea:true   },
  raise_age_4275:    { congress:117, type:"s",     number:4275, category:"Crime",          is_aligned_if_yea:true   },
  george_floyd:      { congress:117, type:"s",     number:3912, category:"Crime",          is_aligned_if_yea:true   },
  de_escalation:     { congress:117, type:"s",     number:null, category:"Crime",          is_aligned_if_yea:true   },
  fed_prison_ovs:    { congress:118, type:"s",     number:null, category:"Crime",          is_aligned_if_yea:true   },
  dom_terrorism:     { congress:117, type:"s",     number:963,  category:"Crime",          is_aligned_if_yea:true   },
  cops_reauth:       { congress:117, type:"s",     number:2584, category:"Crime",          is_aligned_if_yea:true   },
  tvpra:             { congress:117, type:"s",     number:920,  category:"Crime",          is_aligned_if_yea:true   },
  covid_hate:        { congress:117, type:"s",     number:null, category:"Crime",          is_aligned_if_yea:true   },
  report_act:        { congress:118, type:"s",     number:null, category:"Crime",          is_aligned_if_yea:true   },
  mental_justice:    { congress:117, type:"s",     number:1226, category:"Crime",          is_aligned_if_yea:true   },

  // ── DEFICIT / CORRUPTION / TERM LIMITS ───────────────────────────────────
  disclose:          { congress:117, type:"s",     number:443,  category:"Deficit",        is_aligned_if_yea:true   },
  disclose_2939:     { congress:118, type:"s",     number:2939, category:"Deficit",        is_aligned_if_yea:true   },
  stock_ban:         { congress:117, type:"s",     number:3494, category:"Deficit",        is_aligned_if_yea:true   },
  pelosi_act_58:     { congress:118, type:"s",     number:58,   category:"Deficit",        is_aligned_if_yea:true   },
  pelosi_act_693:    { congress:119, type:"s",     number:693,  category:"Deficit",        is_aligned_if_yea:true   },
  honest_1498:       { congress:119, type:"s",     number:1498, category:"Deficit",        is_aligned_if_yea:true   },
  ethics_1171:       { congress:118, type:"s",     number:1171, category:"Deficit",        is_aligned_if_yea:true   },
  scert_act:         { congress:118, type:"s",     number:359,  category:"Deficit",        is_aligned_if_yea:true   },
  sc_ethics_2512:    { congress:117, type:"s",     number:2512, category:"Deficit",        is_aligned_if_yea:true   },
  sc_ethics_325:     { congress:118, type:"s",     number:325,  category:"Deficit",        is_aligned_if_yea:true   },
  sc_term_limits:    { congress:118, type:"s",     number:3096, category:"Deficit",        is_aligned_if_yea:true   },
  no_potus_above:    { congress:117, type:"sjres", number:11,   category:"Deficit",        is_aligned_if_yea:true   },
  pure_exec:         { congress:117, type:"s",     number:4737, category:"Deficit",        is_aligned_if_yea:true   },
  whistleblower:     { congress:117, type:"s",     number:1524, category:"Deficit",        is_aligned_if_yea:true   },
  obbba_deficit:     { congress:119, type:"hr",    number:1,    category:"Deficit",        is_aligned_if_yea:false  },
  obbba_buyback_rep: { congress:119, type:"hr",    number:1,    category:"Deficit",        is_aligned_if_yea:false  },
  term_lim_117:      { congress:117, type:"sjres", number:3,    category:"Deficit",        is_aligned_if_yea:true   },
  term_lim_118:      { congress:118, type:"sjres", number:1,    category:"Deficit",        is_aligned_if_yea:true   },
  term_lim_119:      { congress:119, type:"sjres", number:1,    category:"Deficit",        is_aligned_if_yea:true   },

  // ── GOVERNMENT / SURVEILLANCE / PRIVACY / VOTING ─────────────────────────
  press_act:         { congress:118, type:"s",     number:2074, category:"Government",     is_aligned_if_yea:true   },
  fisa_reform:       { congress:118, type:"s",     number:3961, category:"Government",     is_aligned_if_yea:true   },
  fisa_risaa:        { congress:118, type:"hr",    number:7888, category:"Government",     is_aligned_if_yea:false  },
  ai_elections:      { congress:118, type:"s",     number:2770, category:"Government",     is_aligned_if_yea:true   },
  data_priv_1494:    { congress:117, type:"s",     number:1494, category:"Government",     is_aligned_if_yea:true   },
  data_priv_3195:    { congress:117, type:"s",     number:3195, category:"Government",     is_aligned_if_yea:true   },
  data_priv_4295:    { congress:118, type:"s",     number:4295, category:"Government",     is_aligned_if_yea:true   },
  net_neutrality:    { congress:117, type:"s",     number:4676, category:"Government",     is_aligned_if_yea:true   },
  antitrust_online:  { congress:117, type:"s",     number:2992, category:"Government",     is_aligned_if_yea:true   },
  chips_act:         { congress:117, type:"hr",    number:4346, category:"Government",     is_aligned_if_yea:true   },
  ftv_2747:          { congress:117, type:"s",     number:2747, category:"Government",     is_aligned_if_yea:true   },
  ftv_1_118:         { congress:118, type:"s",     number:1,    category:"Government",     is_aligned_if_yea:true   },
  john_lewis_vra:    { congress:118, type:"s",     number:4,    category:"Government",     is_aligned_if_yea:true   },
  dem_restoration:   { congress:117, type:"s",     number:481,  category:"Government",     is_aligned_if_yea:true   },
  save_act:          { congress:119, type:"s",     number:128,  category:"Government",     is_aligned_if_yea:true   },

  // ── FOREIGN POLICY ───────────────────────────────────────────────────────
  ukraine_aid:       { congress:118, type:"hr",    number:815,  category:"FP",             is_aligned_if_yea:true   },
  russia_sanct:      { congress:119, type:"s",     number:1241, category:"FP",             is_aligned_if_yea:true   },
  ceasefire_res:     { congress:118, type:"sjres", number:111,  category:"FP",             is_aligned_if_yea:true,  reference_only:true },
  uflpa:             { congress:117, type:"s",     number:65,   category:"FP",             is_aligned_if_yea:true   },
  saudi_arms:        { congress:117, type:"sjres", number:31,   category:"FP",             is_aligned_if_yea:true   },
  yemen_wpr:         { congress:117, type:"sjres", number:56,   category:"FP",             is_aligned_if_yea:true   },
  nato_accession:    { congress:117, type:"treaty",number:null, category:"FP",             is_aligned_if_yea:true   },
  ndaa_fy24:         { congress:118, type:"s",     number:2226, category:"FP",             is_aligned_if_yea:true   },

  // ── DRUGS ────────────────────────────────────────────────────────────────
  mat_act:           { congress:117, type:"s",     number:null, category:"Drugs",          is_aligned_if_yea:true   },
  fend_fentanyl:     { congress:118, type:"s",     number:null, category:"Drugs",          is_aligned_if_yea:true   },
  halt_fentanyl:     { congress:119, type:"s",     number:331,  category:"Drugs",          is_aligned_if_yea:true   },
  cara_3:            { congress:117, type:"s",     number:2839, category:"Drugs",          is_aligned_if_yea:true   },
};

// ─── Founding-senator actions (ported directly from Python ACTIONS) ───────────
// Uses Python's internal bill IDs (may differ from API_BILLS keys).
// Plain last names → _ST registry keys. Categories match Python 12-category system.

export const FOUNDING_ACTIONS: SenatorAction[] = [
  // ── IMMIGRATION ──────────────────────────────────────────────────────────
  ["Britt_AL",      "Immigration", "laken_riley",    "lead",      true ],
  ["McConnell_KY",  "Immigration", "laken_riley",    "vote",      true ],
  ["Cruz_TX",       "Immigration", "laken_riley",    "vote",      true ],
  ["Collins_ME",    "Immigration", "laken_riley",    "vote",      true ],
  ["Paul_KY",       "Immigration", "laken_riley",    "vote",      true ],
  ["Graham_SC",     "Immigration", "laken_riley",    "vote",      true ],
  ["Schumer_NY",    "Immigration", "laken_riley",    "vote",      false],
  ["Sanders_VT",    "Immigration", "laken_riley",    "vote",      false],
  ["Warren_MA",     "Immigration", "laken_riley",    "vote",      false],
  ["Gillibrand_NY", "Immigration", "laken_riley",    "vote",      false],
  // Dream Act — internal id 'dream_act'
  ["Graham_SC",     "Immigration", "dream_act",      "cosponsor", true ],
  ["Schumer_NY",    "Immigration", "dream_act",      "cosponsor", true ],
  ["Sanders_VT",    "Immigration", "dream_act",      "cosponsor", true ],
  ["Warren_MA",     "Immigration", "dream_act",      "cosponsor", true ],
  ["Gillibrand_NY", "Immigration", "dream_act",      "cosponsor", true ],
  // Bipartisan Border Bill — internal id 'border_bill'
  ["Schumer_NY",    "Immigration", "border_bill",    "vote",      true ],
  ["Sanders_VT",    "Immigration", "border_bill",    "vote",      true ],
  ["Warren_MA",     "Immigration", "border_bill",    "vote",      true ],
  ["Gillibrand_NY", "Immigration", "border_bill",    "vote",      true ],
  ["Collins_ME",    "Immigration", "border_bill",    "vote",      true ],
  ["McConnell_KY",  "Immigration", "border_bill",    "vote",      false],
  ["Cruz_TX",       "Immigration", "border_bill",    "vote",      false],
  ["Paul_KY",       "Immigration", "border_bill",    "vote",      false],
  ["Graham_SC",     "Immigration", "border_bill",    "vote",      false],
  ["Britt_AL",      "Immigration", "border_bill",    "vote",      false],
  // U.S. Citizenship Act
  ["Schumer_NY",    "Immigration", "citizenship_act","cosponsor", true ],
  ["Sanders_VT",    "Immigration", "citizenship_act","cosponsor", true ],
  ["Warren_MA",     "Immigration", "citizenship_act","cosponsor", true ],
  ["Gillibrand_NY", "Immigration", "citizenship_act","cosponsor", true ],
  // Farm Workforce — internal id 'farm_workforce'
  ["Collins_ME",    "Immigration", "farm_workforce", "vote",      true ],
  ["Schumer_NY",    "Immigration", "farm_workforce", "vote",      true ],
  ["Sanders_VT",    "Immigration", "farm_workforce", "vote",      true ],
  ["Warren_MA",     "Immigration", "farm_workforce", "vote",      true ],
  ["Gillibrand_NY", "Immigration", "farm_workforce", "vote",      true ],
  ["McConnell_KY",  "Immigration", "farm_workforce", "vote",      false],
  ["Cruz_TX",       "Immigration", "farm_workforce", "vote",      false],
  ["Paul_KY",       "Immigration", "farm_workforce", "vote",      false],
  ["Graham_SC",     "Immigration", "farm_workforce", "vote",      false],
  ["Britt_AL",      "Immigration", "farm_workforce", "vote",      false],
  // E-Verify
  ["Cruz_TX",       "Immigration", "everify_118",    "cosponsor", true ],
  ["Cruz_TX",       "Immigration", "everify_119",    "cosponsor", true ],
  ["Britt_AL",      "Immigration", "everify_119",    "cosponsor", true ],
  // OBBBA border
  ["McConnell_KY",  "Immigration", "obbba_border",   "vote",      true ],
  ["Cruz_TX",       "Immigration", "obbba_border",   "vote",      true ],
  ["Graham_SC",     "Immigration", "obbba_border",   "vote",      true ],
  ["Britt_AL",      "Immigration", "obbba_border",   "vote",      true ],
  ["Paul_KY",       "Immigration", "obbba_border",   "vote",      false],
  ["Collins_ME",    "Immigration", "obbba_border",   "vote",      false],
  ["Schumer_NY",    "Immigration", "obbba_border",   "vote",      false],
  ["Sanders_VT",    "Immigration", "obbba_border",   "vote",      false],
  ["Warren_MA",     "Immigration", "obbba_border",   "vote",      false],
  ["Gillibrand_NY", "Immigration", "obbba_border",   "vote",      false],

  // ── HEALTHCARE ───────────────────────────────────────────────────────────
  // IRA drug pricing — internal id 'ira_rx'
  ["Schumer_NY",    "Healthcare",  "ira_rx",         "cosponsor", true ],
  ["Sanders_VT",    "Healthcare",  "ira_rx",         "vote",      true ],
  ["Warren_MA",     "Healthcare",  "ira_rx",         "vote",      true ],
  ["Gillibrand_NY", "Healthcare",  "ira_rx",         "vote",      true ],
  ["McConnell_KY",  "Healthcare",  "ira_rx",         "vote",      false],
  ["Cruz_TX",       "Healthcare",  "ira_rx",         "vote",      false],
  ["Collins_ME",    "Healthcare",  "ira_rx",         "vote",      false],
  ["Graham_SC",     "Healthcare",  "ira_rx",         "vote",      false],
  ["Paul_KY",       "Healthcare",  "ira_rx",         "vote",      false],
  ["Britt_AL",      "Healthcare",  "ira_rx",         "vote",      false],
  // OBBBA Medicaid — internal id 'obbba_med'
  ["Paul_KY",       "Healthcare",  "obbba_med",      "vote",      true ],
  ["Collins_ME",    "Healthcare",  "obbba_med",      "vote",      true ],
  ["McConnell_KY",  "Healthcare",  "obbba_med",      "vote",      false],
  ["Cruz_TX",       "Healthcare",  "obbba_med",      "vote",      false],
  ["Graham_SC",     "Healthcare",  "obbba_med",      "vote",      false],
  ["Britt_AL",      "Healthcare",  "obbba_med",      "vote",      false],
  ["Schumer_NY",    "Healthcare",  "obbba_med",      "vote",      true ],
  ["Sanders_VT",    "Healthcare",  "obbba_med",      "vote",      true ],
  ["Warren_MA",     "Healthcare",  "obbba_med",      "vote",      true ],
  ["Gillibrand_NY", "Healthcare",  "obbba_med",      "vote",      true ],
  // Medical debt
  ["Sanders_VT",    "Healthcare",  "med_debt",       "lead",      true ],

  // ── ENVIRONMENT ──────────────────────────────────────────────────────────
  ["Schumer_NY",    "Environment", "ira_climate",    "cosponsor", true ],
  ["Sanders_VT",    "Environment", "ira_climate",    "vote",      true ],
  ["Warren_MA",     "Environment", "ira_climate",    "vote",      true ],
  ["Gillibrand_NY", "Environment", "ira_climate",    "vote",      true ],
  ["McConnell_KY",  "Environment", "ira_climate",    "vote",      false],
  ["Cruz_TX",       "Environment", "ira_climate",    "vote",      false],
  ["Collins_ME",    "Environment", "ira_climate",    "vote",      false],
  ["Graham_SC",     "Environment", "ira_climate",    "vote",      false],
  ["Paul_KY",       "Environment", "ira_climate",    "vote",      false],
  ["Britt_AL",      "Environment", "ira_climate",    "vote",      false],
  // OBBBA energy — internal id 'obbba_energy'
  ["Paul_KY",       "Environment", "obbba_energy",   "vote",      true ],
  ["Collins_ME",    "Environment", "obbba_energy",   "vote",      true ],
  ["Schumer_NY",    "Environment", "obbba_energy",   "vote",      true ],
  ["Sanders_VT",    "Environment", "obbba_energy",   "vote",      true ],
  ["Warren_MA",     "Environment", "obbba_energy",   "vote",      true ],
  ["Gillibrand_NY", "Environment", "obbba_energy",   "vote",      true ],
  ["McConnell_KY",  "Environment", "obbba_energy",   "vote",      false],
  ["Cruz_TX",       "Environment", "obbba_energy",   "vote",      false],
  ["Graham_SC",     "Environment", "obbba_energy",   "vote",      false],
  ["Britt_AL",      "Environment", "obbba_energy",   "vote",      false],
  // OBBBA EV credits
  ["McConnell_KY",  "Environment", "obbba_ev",       "vote",      false],
  ["Cruz_TX",       "Environment", "obbba_ev",       "vote",      false],
  ["Graham_SC",     "Environment", "obbba_ev",       "vote",      false],
  ["Britt_AL",      "Environment", "obbba_ev",       "vote",      false],
  ["Paul_KY",       "Environment", "obbba_ev",       "vote",      true ],
  ["Collins_ME",    "Environment", "obbba_ev",       "vote",      true ],
  ["Schumer_NY",    "Environment", "obbba_ev",       "vote",      true ],
  ["Sanders_VT",    "Environment", "obbba_ev",       "vote",      true ],
  ["Warren_MA",     "Environment", "obbba_ev",       "vote",      true ],
  ["Gillibrand_NY", "Environment", "obbba_ev",       "vote",      true ],

  // ── CRIME / GUNS ─────────────────────────────────────────────────────────
  ["Collins_ME",    "Crime",       "bsca",           "cosponsor", true ],
  ["Schumer_NY",    "Crime",       "bsca",           "vote",      true ],
  ["Sanders_VT",    "Crime",       "bsca",           "vote",      true ],
  ["Warren_MA",     "Crime",       "bsca",           "vote",      true ],
  ["Gillibrand_NY", "Crime",       "bsca",           "vote",      true ],
  ["McConnell_KY",  "Crime",       "bsca",           "vote",      true ],
  ["Graham_SC",     "Crime",       "bsca",           "vote",      true ],
  ["Cruz_TX",       "Crime",       "bsca",           "vote",      false],
  ["Paul_KY",       "Crime",       "bsca",           "vote",      false],
  // De-escalation Training
  ["Schumer_NY",    "Crime",       "deesc",          "vote",      true ],
  ["Sanders_VT",    "Crime",       "deesc",          "vote",      true ],
  ["Warren_MA",     "Crime",       "deesc",          "vote",      true ],
  ["Collins_ME",    "Crime",       "deesc",          "vote",      true ],
  ["Gillibrand_NY", "Crime",       "deesc",          "vote",      true ],
  ["McConnell_KY",  "Crime",       "deesc",          "vote",      true ],
  ["Graham_SC",     "Crime",       "deesc",          "vote",      true ],
  ["Cruz_TX",       "Crime",       "deesc",          "vote",      true ],
  ["Paul_KY",       "Crime",       "deesc",          "vote",      true ],
  ["Britt_AL",      "Crime",       "deesc",          "vote",      true ],
  // Federal Prison Oversight
  ["Schumer_NY",    "Crime",       "prison_ov",      "vote",      true ],
  ["Sanders_VT",    "Crime",       "prison_ov",      "vote",      true ],
  ["Warren_MA",     "Crime",       "prison_ov",      "vote",      true ],
  ["Collins_ME",    "Crime",       "prison_ov",      "vote",      true ],
  ["Gillibrand_NY", "Crime",       "prison_ov",      "vote",      true ],
  ["McConnell_KY",  "Crime",       "prison_ov",      "vote",      true ],
  ["Graham_SC",     "Crime",       "prison_ov",      "vote",      true ],
  ["Cruz_TX",       "Crime",       "prison_ov",      "vote",      true ],
  ["Paul_KY",       "Crime",       "prison_ov",      "vote",      true ],
  ["Britt_AL",      "Crime",       "prison_ov",      "vote",      true ],
  // George Floyd Justice in Policing — internal id 'gfja'
  ["Schumer_NY",    "Crime",       "gfja",           "vote",      true ],
  ["Sanders_VT",    "Crime",       "gfja",           "cosponsor", true ],
  ["Warren_MA",     "Crime",       "gfja",           "cosponsor", true ],
  ["Gillibrand_NY", "Crime",       "gfja",           "cosponsor", true ],
  ["McConnell_KY",  "Crime",       "gfja",           "vote",      false],
  ["Cruz_TX",       "Crime",       "gfja",           "vote",      false],
  ["Graham_SC",     "Crime",       "gfja",           "vote",      false],
  ["Britt_AL",      "Crime",       "gfja",           "vote",      false],
  ["Paul_KY",       "Crime",       "gfja",           "vote",      false],
  ["Collins_ME",    "Crime",       "gfja",           "vote",      false],

  // ── SOCIAL SECURITY ──────────────────────────────────────────────────────
  ["Sanders_VT",    "Social Security","ss_exp",      "lead",      true ],
  ["Warren_MA",     "Social Security","ss_exp",      "cosponsor", true ],
  ["Gillibrand_NY", "Social Security","ss_exp",      "cosponsor", true ],
  ["Schumer_NY",    "Social Security","ss_exp",      "cosponsor", true ],
  // OBBBA no tax on SS benefits
  ["McConnell_KY",  "Social Security","obbba_ss",    "vote",      true ],
  ["Cruz_TX",       "Social Security","obbba_ss",    "vote",      true ],
  ["Graham_SC",     "Social Security","obbba_ss",    "vote",      true ],
  ["Britt_AL",      "Social Security","obbba_ss",    "vote",      true ],
  ["Paul_KY",       "Social Security","obbba_ss",    "vote",      false],
  ["Collins_ME",    "Social Security","obbba_ss",    "vote",      false],
  ["Schumer_NY",    "Social Security","obbba_ss",    "vote",      false],
  ["Sanders_VT",    "Social Security","obbba_ss",    "vote",      false],
  ["Warren_MA",     "Social Security","obbba_ss",    "vote",      false],
  ["Gillibrand_NY", "Social Security","obbba_ss",    "vote",      false],

  // ── DRUGS ────────────────────────────────────────────────────────────────
  // Cannabis Admin — internal id 'cannabis'
  ["Schumer_NY",    "Drugs",       "cannabis",       "lead",      true ],
  ["Sanders_VT",    "Drugs",       "cannabis",       "cosponsor", true ],
  ["Warren_MA",     "Drugs",       "cannabis",       "cosponsor", true ],
  // FEND Off Fentanyl — internal id 'fend_fent'
  ["Schumer_NY",    "Drugs",       "fend_fent",      "vote",      true ],
  ["Sanders_VT",    "Drugs",       "fend_fent",      "vote",      true ],
  ["Warren_MA",     "Drugs",       "fend_fent",      "vote",      true ],
  ["Collins_ME",    "Drugs",       "fend_fent",      "vote",      true ],
  ["Gillibrand_NY", "Drugs",       "fend_fent",      "vote",      true ],
  ["McConnell_KY",  "Drugs",       "fend_fent",      "vote",      true ],
  ["Cruz_TX",       "Drugs",       "fend_fent",      "vote",      true ],
  ["Graham_SC",     "Drugs",       "fend_fent",      "vote",      true ],
  ["Paul_KY",       "Drugs",       "fend_fent",      "vote",      true ],
  ["Britt_AL",      "Drugs",       "fend_fent",      "vote",      true ],
  // MAT/buprenorphine — internal id 'mat'
  ["Schumer_NY",    "Drugs",       "mat",            "vote",      true ],
  ["Sanders_VT",    "Drugs",       "mat",            "vote",      true ],
  ["Warren_MA",     "Drugs",       "mat",            "vote",      true ],
  ["Collins_ME",    "Drugs",       "mat",            "vote",      true ],
  ["Gillibrand_NY", "Drugs",       "mat",            "vote",      true ],
  ["McConnell_KY",  "Drugs",       "mat",            "vote",      true ],
  ["Graham_SC",     "Drugs",       "mat",            "vote",      true ],
  ["Cruz_TX",       "Drugs",       "mat",            "vote",      false],
  ["Paul_KY",       "Drugs",       "mat",            "vote",      false],
  ["Britt_AL",      "Drugs",       "mat",            "vote",      false],

  // ── HUNGER / VETERANS ────────────────────────────────────────────────────
  // PACT Act — internal id 'pact'
  ["Schumer_NY",    "Hunger",      "pact",           "vote",      true ],
  ["Sanders_VT",    "Hunger",      "pact",           "vote",      true ],
  ["Warren_MA",     "Hunger",      "pact",           "vote",      true ],
  ["Collins_ME",    "Hunger",      "pact",           "vote",      true ],
  ["Gillibrand_NY", "Hunger",      "pact",           "vote",      true ],
  ["McConnell_KY",  "Hunger",      "pact",           "vote",      true ],
  ["Cruz_TX",       "Hunger",      "pact",           "vote",      true ],
  ["Graham_SC",     "Hunger",      "pact",           "vote",      true ],
  ["Paul_KY",       "Hunger",      "pact",           "vote",      false],
  // OBBBA SNAP cuts
  ["Paul_KY",       "Hunger",      "obbba_snap",     "vote",      true ],
  ["Collins_ME",    "Hunger",      "obbba_snap",     "vote",      true ],
  ["Schumer_NY",    "Hunger",      "obbba_snap",     "vote",      true ],
  ["Sanders_VT",    "Hunger",      "obbba_snap",     "vote",      true ],
  ["Warren_MA",     "Hunger",      "obbba_snap",     "vote",      true ],
  ["Gillibrand_NY", "Hunger",      "obbba_snap",     "vote",      true ],
  ["McConnell_KY",  "Hunger",      "obbba_snap",     "vote",      false],
  ["Cruz_TX",       "Hunger",      "obbba_snap",     "vote",      false],
  ["Graham_SC",     "Hunger",      "obbba_snap",     "vote",      false],
  ["Britt_AL",      "Hunger",      "obbba_snap",     "vote",      false],

  // ── ECONOMY ──────────────────────────────────────────────────────────────
  // IIJA
  ["Schumer_NY",    "Economy",     "iija",           "vote",      true ],
  ["Sanders_VT",    "Economy",     "iija",           "vote",      true ],
  ["Warren_MA",     "Economy",     "iija",           "vote",      true ],
  ["Collins_ME",    "Economy",     "iija",           "cosponsor", true ],
  ["Gillibrand_NY", "Economy",     "iija",           "vote",      true ],
  ["McConnell_KY",  "Economy",     "iija",           "vote",      true ],
  ["Graham_SC",     "Economy",     "iija",           "vote",      true ],
  ["Cruz_TX",       "Economy",     "iija",           "vote",      false],
  ["Paul_KY",       "Economy",     "iija",           "vote",      false],
  // No Tax on Tips — internal id 'no_tips'
  ["Cruz_TX",       "Economy",     "no_tips",        "lead",      true ],
  ["Schumer_NY",    "Economy",     "no_tips",        "vote",      true ],
  ["Sanders_VT",    "Economy",     "no_tips",        "vote",      true ],
  ["Warren_MA",     "Economy",     "no_tips",        "vote",      true ],
  ["Collins_ME",    "Economy",     "no_tips",        "vote",      true ],
  ["Gillibrand_NY", "Economy",     "no_tips",        "vote",      true ],
  ["McConnell_KY",  "Economy",     "no_tips",        "vote",      true ],
  ["Graham_SC",     "Economy",     "no_tips",        "vote",      true ],
  ["Paul_KY",       "Economy",     "no_tips",        "vote",      true ],
  ["Britt_AL",      "Economy",     "no_tips",        "vote",      true ],
  // No Tax on Overtime — internal id 'no_ot'
  ["Schumer_NY",    "Economy",     "no_ot",          "vote",      false],
  ["Sanders_VT",    "Economy",     "no_ot",          "vote",      false],
  ["Warren_MA",     "Economy",     "no_ot",          "vote",      false],
  ["Gillibrand_NY", "Economy",     "no_ot",          "vote",      false],
  ["McConnell_KY",  "Economy",     "no_ot",          "vote",      true ],
  ["Cruz_TX",       "Economy",     "no_ot",          "vote",      true ],
  ["Graham_SC",     "Economy",     "no_ot",          "vote",      true ],
  ["Britt_AL",      "Economy",     "no_ot",          "vote",      true ],
  ["Paul_KY",       "Economy",     "no_ot",          "vote",      false],
  ["Collins_ME",    "Economy",     "no_ot",          "vote",      false],
  // OBBBA Child Tax Credit
  ["McConnell_KY",  "Economy",     "obbba_ctc",      "vote",      true ],
  ["Cruz_TX",       "Economy",     "obbba_ctc",      "vote",      true ],
  ["Graham_SC",     "Economy",     "obbba_ctc",      "vote",      true ],
  ["Britt_AL",      "Economy",     "obbba_ctc",      "vote",      true ],
  ["Paul_KY",       "Economy",     "obbba_ctc",      "vote",      false],
  ["Collins_ME",    "Economy",     "obbba_ctc",      "vote",      false],
  ["Schumer_NY",    "Economy",     "obbba_ctc",      "vote",      false],
  ["Sanders_VT",    "Economy",     "obbba_ctc",      "vote",      false],
  ["Warren_MA",     "Economy",     "obbba_ctc",      "vote",      false],
  ["Gillibrand_NY", "Economy",     "obbba_ctc",      "vote",      false],
  // OBBBA student loan elimination
  ["McConnell_KY",  "Economy",     "obbba_loans",    "vote",      false],
  ["Cruz_TX",       "Economy",     "obbba_loans",    "vote",      false],
  ["Graham_SC",     "Economy",     "obbba_loans",    "vote",      false],
  ["Britt_AL",      "Economy",     "obbba_loans",    "vote",      false],
  ["Paul_KY",       "Economy",     "obbba_loans",    "vote",      true ],
  ["Collins_ME",    "Economy",     "obbba_loans",    "vote",      true ],
  ["Schumer_NY",    "Economy",     "obbba_loans",    "vote",      true ],
  ["Sanders_VT",    "Economy",     "obbba_loans",    "vote",      true ],
  ["Warren_MA",     "Economy",     "obbba_loans",    "vote",      true ],
  ["Gillibrand_NY", "Economy",     "obbba_loans",    "vote",      true ],
  // Minimum wage — internal id 'min_wage'
  ["Sanders_VT",    "Economy",     "min_wage",       "lead",      true ],
  ["Warren_MA",     "Economy",     "min_wage",       "cosponsor", true ],
  ["Schumer_NY",    "Economy",     "min_wage",       "cosponsor", true ],
  ["Gillibrand_NY", "Economy",     "min_wage",       "cosponsor", true ],
  // S.J.Res.37 tariff disapproval
  ["Schumer_NY",    "Economy",     "sjres37",        "vote",      true ],
  ["Sanders_VT",    "Economy",     "sjres37",        "vote",      true ],
  ["Warren_MA",     "Economy",     "sjres37",        "vote",      true ],
  ["Gillibrand_NY", "Economy",     "sjres37",        "vote",      true ],
  ["Paul_KY",       "Economy",     "sjres37",        "vote",      true ],
  ["McConnell_KY",  "Economy",     "sjres37",        "vote",      false],
  ["Cruz_TX",       "Economy",     "sjres37",        "vote",      false],
  ["Graham_SC",     "Economy",     "sjres37",        "vote",      false],
  ["Britt_AL",      "Economy",     "sjres37",        "vote",      false],
  ["Collins_ME",    "Economy",     "sjres37",        "vote",      false],

  // ── DEFICIT / CORRUPTION ─────────────────────────────────────────────────
  // DISCLOSE Act cloture
  ["Sanders_VT",    "Deficit",     "disclose",       "vote",      true ],
  ["Warren_MA",     "Deficit",     "disclose",       "vote",      true ],
  ["Gillibrand_NY", "Deficit",     "disclose",       "vote",      true ],
  ["McConnell_KY",  "Deficit",     "disclose",       "vote",      false],
  ["Cruz_TX",       "Deficit",     "disclose",       "vote",      false],
  ["Collins_ME",    "Deficit",     "disclose",       "vote",      false],
  ["Graham_SC",     "Deficit",     "disclose",       "vote",      false],
  ["Paul_KY",       "Deficit",     "disclose",       "vote",      false],
  // Stock trading ban — Schumer never scheduled (block)
  ["Schumer_NY",    "Deficit",     "stock_ban",      "block",     false],
  ["Sanders_VT",    "Deficit",     "stock_ban",      "cosponsor", true ],
  ["Warren_MA",     "Deficit",     "stock_ban",      "cosponsor", true ],
  // Term limits amendment
  ["Cruz_TX",       "Deficit",     "term_lim",       "lead",      true ],
  ["Britt_AL",      "Deficit",     "term_lim",       "cosponsor", true ],
  ["Paul_KY",       "Deficit",     "term_lim",       "vote",      true ],
  ["Graham_SC",     "Deficit",     "term_lim",       "vote",      true ],
  // OBBBA deficit
  ["Paul_KY",       "Deficit",     "obbba_deficit",  "vote",      true ],
  ["Collins_ME",    "Deficit",     "obbba_deficit",  "vote",      true ],
  ["Schumer_NY",    "Deficit",     "obbba_deficit",  "vote",      true ],
  ["Sanders_VT",    "Deficit",     "obbba_deficit",  "vote",      true ],
  ["Warren_MA",     "Deficit",     "obbba_deficit",  "vote",      true ],
  ["Gillibrand_NY", "Deficit",     "obbba_deficit",  "vote",      true ],
  ["McConnell_KY",  "Deficit",     "obbba_deficit",  "vote",      false],
  ["Cruz_TX",       "Deficit",     "obbba_deficit",  "vote",      false],
  ["Graham_SC",     "Deficit",     "obbba_deficit",  "vote",      false],
  ["Britt_AL",      "Deficit",     "obbba_deficit",  "vote",      false],

  // ── GOVERNMENT ───────────────────────────────────────────────────────────
  // CHIPS Act — internal id 'chips'
  ["Schumer_NY",    "Government",  "chips",          "cosponsor", true ],
  ["Warren_MA",     "Government",  "chips",          "vote",      true ],
  ["Collins_ME",    "Government",  "chips",          "vote",      true ],
  ["Gillibrand_NY", "Government",  "chips",          "vote",      true ],
  ["McConnell_KY",  "Government",  "chips",          "vote",      true ],
  ["Graham_SC",     "Government",  "chips",          "vote",      true ],
  ["Cruz_TX",       "Government",  "chips",          "vote",      false],
  ["Paul_KY",       "Government",  "chips",          "vote",      false],
  ["Sanders_VT",    "Government",  "chips",          "vote",      false],
  // Big Tech antitrust block — internal id 'bigtech'
  ["Schumer_NY",    "Government",  "bigtech",        "block",     false],
  // PRESS Act
  ["Sanders_VT",    "Government",  "press_act",      "vote",      true ],
  ["Warren_MA",     "Government",  "press_act",      "vote",      true ],
  ["Cruz_TX",       "Government",  "press_act",      "vote",      true ],
  ["Paul_KY",       "Government",  "press_act",      "vote",      true ],
  ["Collins_ME",    "Government",  "press_act",      "vote",      true ],
  // RISAA (FISA reauth — MISALIGNED) — internal id 'risaa'
  ["Sanders_VT",    "Government",  "risaa",          "vote",      true ],
  ["Warren_MA",     "Government",  "risaa",          "vote",      true ],
  ["Cruz_TX",       "Government",  "risaa",          "vote",      true ],
  ["Paul_KY",       "Government",  "risaa",          "vote",      true ],
  ["Schumer_NY",    "Government",  "risaa",          "vote",      false],
  ["McConnell_KY",  "Government",  "risaa",          "vote",      false],
  ["Collins_ME",    "Government",  "risaa",          "vote",      false],
  ["Graham_SC",     "Government",  "risaa",          "vote",      false],
  ["Gillibrand_NY", "Government",  "risaa",          "vote",      false],
  ["Britt_AL",      "Government",  "risaa",          "vote",      false],
  // Freedom to Vote Act — internal id 'ftva'
  ["Schumer_NY",    "Government",  "ftva",           "vote",      true ],
  ["Sanders_VT",    "Government",  "ftva",           "cosponsor", true ],
  ["Warren_MA",     "Government",  "ftva",           "cosponsor", true ],
  ["Gillibrand_NY", "Government",  "ftva",           "cosponsor", true ],
  ["McConnell_KY",  "Government",  "ftva",           "vote",      false],
  ["Cruz_TX",       "Government",  "ftva",           "vote",      false],
  ["Collins_ME",    "Government",  "ftva",           "vote",      false],
  ["Paul_KY",       "Government",  "ftva",           "vote",      false],
  ["Graham_SC",     "Government",  "ftva",           "vote",      false],
  ["Britt_AL",      "Government",  "ftva",           "vote",      false],
  // SAVE Act (voter ID — internal id 'save_act')
  ["Paul_KY",       "Government",  "save_act",       "vote",      true ],
  ["Cruz_TX",       "Government",  "save_act",       "vote",      true ],
  ["McConnell_KY",  "Government",  "save_act",       "vote",      true ],
  ["Graham_SC",     "Government",  "save_act",       "vote",      true ],
  ["Britt_AL",      "Government",  "save_act",       "vote",      true ],
  ["Collins_ME",    "Government",  "save_act",       "vote",      true ],
  ["Schumer_NY",    "Government",  "save_act",       "vote",      false],
  ["Sanders_VT",    "Government",  "save_act",       "vote",      false],
  ["Warren_MA",     "Government",  "save_act",       "vote",      false],
  ["Gillibrand_NY", "Government",  "save_act",       "vote",      false],

  // ── FOREIGN POLICY ───────────────────────────────────────────────────────
  // Ukraine aid
  ["Schumer_NY",    "FP",          "ukraine_aid",    "vote",      true ],
  ["Sanders_VT",    "FP",          "ukraine_aid",    "vote",      true ],
  ["Warren_MA",     "FP",          "ukraine_aid",    "vote",      true ],
  ["Collins_ME",    "FP",          "ukraine_aid",    "vote",      true ],
  ["Gillibrand_NY", "FP",          "ukraine_aid",    "vote",      true ],
  ["McConnell_KY",  "FP",          "ukraine_aid",    "vote",      true ],
  ["Graham_SC",     "FP",          "ukraine_aid",    "vote",      true ],
  ["Cruz_TX",       "FP",          "ukraine_aid",    "vote",      true ],
  ["Britt_AL",      "FP",          "ukraine_aid",    "vote",      true ],
  ["Paul_KY",       "FP",          "ukraine_aid",    "vote",      false],
  // Russia Sanctions
  ["Graham_SC",     "FP",          "russia_sanct",   "lead",      true ],
  ["McConnell_KY",  "FP",          "russia_sanct",   "block",     false],
  ["Schumer_NY",    "FP",          "russia_sanct",   "vote",      true ],
  ["Sanders_VT",    "FP",          "russia_sanct",   "vote",      true ],
  ["Warren_MA",     "FP",          "russia_sanct",   "vote",      true ],
  // Saudi Arms — internal id 'saudi_arms'
  ["Sanders_VT",    "FP",          "saudi_arms",     "lead",      true ],
  ["Paul_KY",       "FP",          "saudi_arms",     "lead",      true ],
  ["Warren_MA",     "FP",          "saudi_arms",     "cosponsor", true ],
  ["McConnell_KY",  "FP",          "saudi_arms",     "vote",      false],
  ["Schumer_NY",    "FP",          "saudi_arms",     "vote",      false],
  ["Gillibrand_NY", "FP",          "saudi_arms",     "vote",      false],
  ["Cruz_TX",       "FP",          "saudi_arms",     "vote",      false],
  ["Graham_SC",     "FP",          "saudi_arms",     "vote",      false],
  ["Collins_ME",    "FP",          "saudi_arms",     "vote",      false],
  // Yemen WPR
  ["Sanders_VT",    "FP",          "yemen_wpr",      "lead",      true ],
  // NATO accession
  ["McConnell_KY",  "FP",          "nato_accession", "vote",      true ],
  ["Schumer_NY",    "FP",          "nato_accession", "vote",      true ],
  ["Sanders_VT",    "FP",          "nato_accession", "vote",      true ],
  ["Warren_MA",     "FP",          "nato_accession", "vote",      true ],
  ["Cruz_TX",       "FP",          "nato_accession", "vote",      true ],
  ["Collins_ME",    "FP",          "nato_accession", "vote",      true ],
  ["Gillibrand_NY", "FP",          "nato_accession", "vote",      true ],
  ["Graham_SC",     "FP",          "nato_accession", "vote",      true ],
  ["Paul_KY",       "FP",          "nato_accession", "vote",      true ],
  // NDAA FY2024
  ["McConnell_KY",  "FP",          "ndaa_fy24",      "vote",      true ],
  ["Schumer_NY",    "FP",          "ndaa_fy24",      "vote",      true ],
  ["Sanders_VT",    "FP",          "ndaa_fy24",      "vote",      true ],
  ["Warren_MA",     "FP",          "ndaa_fy24",      "vote",      true ],
  ["Cruz_TX",       "FP",          "ndaa_fy24",      "vote",      true ],
  ["Collins_ME",    "FP",          "ndaa_fy24",      "vote",      true ],
  ["Gillibrand_NY", "FP",          "ndaa_fy24",      "vote",      true ],
  ["Britt_AL",      "FP",          "ndaa_fy24",      "vote",      true ],
  ["Graham_SC",     "FP",          "ndaa_fy24",      "vote",      true ],
  ["Paul_KY",       "FP",          "ndaa_fy24",      "vote",      false],
  // UFLPA
  ["McConnell_KY",  "FP",          "uflpa",          "vote",      true ],
  ["Cruz_TX",       "FP",          "uflpa",          "vote",      true ],
  ["Graham_SC",     "FP",          "uflpa",          "vote",      true ],
  ["Britt_AL",      "FP",          "uflpa",          "vote",      true ],
  ["Paul_KY",       "FP",          "uflpa",          "vote",      true ],
  ["Collins_ME",    "FP",          "uflpa",          "vote",      true ],
  ["Schumer_NY",    "FP",          "uflpa",          "vote",      true ],
  ["Sanders_VT",    "FP",          "uflpa",          "vote",      true ],
  ["Warren_MA",     "FP",          "uflpa",          "vote",      true ],
  ["Gillibrand_NY", "FP",          "uflpa",          "vote",      true ],
];

// ─── Manual actions (lead sponsors, blocks, committee) ────────────────────────
// Ported from Python MANUAL_ACTIONS. Uses API_BILLS keys as bill IDs.
// Format: [registry_key, category, bill_id, action, aligned]

export const MANUAL_ACTIONS: SenatorAction[] = [
  // ── IMMIGRATION ──────────────────────────────────────────────────────────
  ["Britt_AL",      "Immigration", "laken_riley",    "lead",      true ],
  ["Grassley_IA",   "Immigration", "everify_118",    "lead",      true ],
  ["Grassley_IA",   "Immigration", "everify_119",    "lead",      true ],
  ["Durbin_IL",     "Immigration", "dream_264",      "lead",      true ],
  ["Graham_SC",     "Immigration", "dream_264",      "lead",      true ],
  ["Durbin_IL",     "Immigration", "dream_365",      "lead",      true ],
  ["Graham_SC",     "Immigration", "dream_365",      "lead",      true ],
  ["Durbin_IL",     "Immigration", "dream_act_25",   "lead",      true ],
  ["Murkowski_AK",  "Immigration", "dream_act_25",   "lead",      true ],
  ["Menendez_NJ",   "Immigration", "citizenship_act","lead",      true ],
  ["Padilla_CA",    "Immigration", "citizenship_act","lead",      true ],
  ["Bennet_CO",     "Immigration", "farm_wf_1045",   "lead",      true ],
  ["Crapo_ID",      "Immigration", "farm_wf_1045",   "lead",      true ],
  ["Durbin_IL",     "Immigration", "stem_1233",      "lead",      true ],
  ["Rounds_SD",     "Immigration", "stem_1233",      "lead",      true ],
  ["King_ME",       "Immigration", "stem_1233",      "cosponsor", true ],
  ["Lankford_OK",   "Immigration", "border_s4361",   "lead",      true ],
  ["Murphy_CT",     "Immigration", "border_s4361",   "lead",      true ],

  // ── HOUSING / PERSONAL FINANCE ──────────────────────────────────────────
  ["Gillibrand_NY", "Housing",     "family_act_248", "lead",      true ],
  ["Gillibrand_NY", "Housing",     "family_act_2823","lead",      true ],
  ["Gillibrand_NY", "Housing",     "family_act_1714","lead",      true ],
  ["Warren_MA",     "Housing",     "price_gouge_4214","lead",     true ],
  ["Casey_PA",      "Housing",     "price_gouge_4214","lead",     true ],
  ["Warren_MA",     "Housing",     "price_gouge_3803","lead",     true ],
  ["Casey_PA",      "Housing",     "price_gouge_3803","lead",     true ],
  ["Blumenthal_CT", "Housing",     "junk_fees_916",  "lead",      true ],
  ["Whitehouse_RI", "Housing",     "junk_fees_916",  "lead",      true ],
  ["Tester_MT",     "Housing",     "fair_repair",    "lead",      true ],
  ["Schatz_HI",     "Housing",     "road_housing",   "lead",      true ],
  ["Cantwell_WA",   "Housing",     "housing_credit", "lead",      true ],
  ["Young_IN",      "Housing",     "housing_credit", "lead",      true ],
  ["Warnock_GA",    "Housing",     "downpayment",    "lead",      true ],
  ["Welch_VT",      "Housing",     "end_homelessness","lead",     true ],
  ["Merkley_OR",    "Housing",     "end_hedge_fund", "lead",      true ],
  ["Smith_MN",      "Housing",     "end_hedge_fund", "lead",      true ],
  ["Young_IN",      "Housing",     "fam_stability_v","lead",      true ],
  ["Coons_DE",      "Housing",     "fam_stability_v","lead",      true ],

  // ── ECONOMY / EDUCATION / LABOR ─────────────────────────────────────────
  ["Wyden_OR",      "Economy",     "sjres37",        "lead",      true ],
  ["Grassley_IA",   "Economy",     "sjres37",        "lead",      true ],
  ["Murray_WA",     "Economy",     "pre_k_1573",     "lead",      true ],
  ["Murray_WA",     "Economy",     "pell_grant_2920","lead",      true ],
  ["Murray_WA",     "Economy",     "childcare_1354", "lead",      true ],
  ["Casey_PA",      "Economy",     "childcare_1354", "lead",      true ],
  ["Murray_WA",     "Economy",     "pro_act_420",    "lead",      true ],
  ["Sanders_VT",    "Economy",     "pro_act_567_117","lead",      true ],
  ["Murray_WA",     "Economy",     "pro_act_567_117","lead",      true ],
  ["Sanders_VT",    "Economy",     "pro_act_567_118","lead",      true ],
  ["Murray_WA",     "Economy",     "pro_act_567_118","lead",      true ],
  ["Sanders_VT",    "Economy",     "pro_act_852",    "lead",      true ],
  ["Sanders_VT",    "Economy",     "raise_wage_53",  "lead",      true ],
  ["Murray_WA",     "Economy",     "raise_wage_53",  "lead",      true ],
  ["Sanders_VT",    "Economy",     "raise_wage_2488","lead",      true ],
  ["Murray_WA",     "Economy",     "raise_wage_2488","lead",      true ],
  ["Sanders_VT",    "Economy",     "raise_wage_1332","lead",      true ],
  ["Sanders_VT",    "Economy",     "apprenticeship", "lead",      true ],
  ["Casey_PA",      "Economy",     "amer_energy_wkr","lead",      true ],
  ["Portman_OH",    "Economy",     "iija",           "lead",      true ],
  ["Sinema_AZ",     "Economy",     "iija",           "lead",      true ],
  ["Cruz_TX",       "Economy",     "no_tips_tax",    "lead",      true ],
  ["Rosen_NV",      "Economy",     "no_tips_tax",    "lead",      true ],
  ["Hawley_MO",     "Economy",     "no_overtime_tax","lead",      true ],
  ["Wyden_OR",      "Economy",     "ira_stock_buyback","lead",    true ],
  ["Brown_OH",      "Economy",     "ira_stock_buyback","lead",    true ],
  ["Wyden_OR",      "Economy",     "ctc_expansion",  "lead",      true ],

  // ── HEALTHCARE ──────────────────────────────────────────────────────────
  ["Kaine_VA",      "Healthcare",  "drug_price_908", "lead",      true ],
  ["Klobuchar_MN",  "Healthcare",  "drug_price_833", "lead",      true ],
  ["Wyden_OR",      "Healthcare",  "ira_drug_pricing","lead",     true ],
  ["Murray_WA",     "Healthcare",  "ira_drug_pricing","lead",     true ],
  ["Wyden_OR",      "Healthcare",  "smart_prices",   "lead",      true ],
  ["Murphy_CT",     "Healthcare",  "mental_parity",  "lead",      true ],
  ["Cassidy_LA",    "Healthcare",  "mental_parity",  "lead",      true ],
  ["Shaheen_NH",    "Healthcare",  "drugsfromcanada","lead",      true ],
  ["Merkley_OR",    "Healthcare",  "med_debt_3103",  "lead",      true ],
  ["Menendez_NJ",   "Healthcare",  "med_debt_3103",  "lead",      true ],
  ["Sanders_VT",    "Healthcare",  "med_debt",       "lead",      true ],
  ["Merkley_OR",    "Healthcare",  "med_debt",       "lead",      true ],
  ["Merkley_OR",    "Healthcare",  "med_debt_2519",  "lead",      true ],
  ["Merkley_OR",    "Healthcare",  "choose_medicare","lead",      true ],
  ["Hassan_NH",     "Healthcare",  "pre_existing",   "lead",      true ],
  ["Cassidy_LA",    "Healthcare",  "price_transparency","lead",   true ],
  ["Braun_IN",      "Healthcare",  "price_transparency","lead",   true ],
  ["Hassan_NH",     "Healthcare",  "price_transparency","lead",   true ],
  ["Markey_MA",     "Healthcare",  "contraception_4557","lead",   true ],
  ["Markey_MA",     "Healthcare",  "contraception_422","lead",    true ],
  ["Durbin_IL",     "Healthcare",  "vawa_reauth",    "lead",      true ],
  ["Ernst_IA",      "Healthcare",  "vawa_reauth",    "lead",      true ],

  // ── SOCIAL SECURITY ──────────────────────────────────────────────────────
  ["Sanders_VT",    "Social Security","ss_expand_4365","lead",    true ],
  ["Sanders_VT",    "Social Security","ss_expand_770", "lead",    true ],
  ["Brown_OH",      "Social Security","ss_fairness",   "lead",    true ],
  ["Collins_ME",    "Social Security","ss_fairness",   "lead",    true ],
  ["Whitehouse_RI", "Social Security","ss_fair_share", "lead",    true ],
  ["Brown_OH",      "Social Security","no_tax_ss",     "lead",    true ],
  ["Casey_PA",      "Social Security","ss_protect_3177","lead",   true ],
  ["Whitehouse_RI", "Social Security","safeguard_ss",  "lead",    true ],

  // ── ENVIRONMENT ──────────────────────────────────────────────────────────
  ["Heinrich_NM",   "Environment", "public_lands_ren","lead",    true ],
  ["Risch_ID",      "Environment", "public_lands_ren","lead",    true ],
  ["Markey_MA",     "Environment", "climate_edu",    "lead",     true ],
  ["Booker_NJ",     "Environment", "env_justice_919","lead",     true ],
  ["Duckworth_IL",  "Environment", "env_justice_919","lead",     true ],
  ["Wyden_OR",      "Environment", "clean_energy_1298","lead",   true ],
  ["Markey_MA",     "Environment", "polluters_pay",  "lead",     true ],
  ["Warren_MA",     "Environment", "polluters_pay",  "lead",     true ],
  ["Coons_DE",      "Environment", "weatherize_2418","lead",     true ],
  ["Collins_ME",    "Environment", "weatherize_2418","lead",     true ],
  ["Stabenow_MI",   "Environment", "growing_climate","lead",     true ],
  ["Braun_IN",      "Environment", "growing_climate","lead",     true ],
  ["Coons_DE",      "Environment", "americas_clean", "lead",     true ],
  ["Whitehouse_RI", "Environment", "save_our_future","lead",     true ],
  ["Schatz_HI",     "Environment", "save_our_future","lead",     true ],
  ["Padilla_CA",    "Environment", "heat_illness",   "lead",     true ],
  ["Cassidy_LA",    "Environment", "foreign_poll_fee","lead",    true ],
  ["Graham_SC",     "Environment", "foreign_poll_fee","lead",    true ],

  // ── HUNGER / FOOD / VETERANS ─────────────────────────────────────────────
  ["Sanders_VT",    "Hunger",      "school_meals",   "lead",     true ],
  ["Gillibrand_NY", "Hunger",      "school_meals",   "lead",     true ],
  ["Gillibrand_NY", "Hunger",      "closing_meal_gap","lead",    true ],
  ["Stabenow_MI",   "Hunger",      "snap_nutrition", "lead",     true ],
  ["Tester_MT",     "Hunger",      "pact_act",       "lead",     true ],
  ["Tester_MT",     "Hunger",      "veterans_home",  "lead",     true ],

  // ── CRIME / GUNS ─────────────────────────────────────────────────────────
  ["Murphy_CT",     "Crime",       "bsca",           "lead",     true ],
  ["Cornyn_TX",     "Crime",       "bsca",           "lead",     true ],
  ["Murphy_CT",     "Crime",       "bgcks_529",      "lead",     true ],
  ["Schumer_NY",    "Crime",       "bgcks_529",      "lead",     true ],
  ["Blumenthal_CT", "Crime",       "bgcks_529",      "lead",     true ],
  ["Murphy_CT",     "Crime",       "bgcks_494",      "lead",     true ],
  ["Murphy_CT",     "Crime",       "bgcks_3214",     "lead",     true ],
  ["Blumenthal_CT", "Crime",       "bgcks_3458",     "lead",     true ],
  ["Blumenthal_CT", "Crime",       "erpo_292",       "lead",     true ],
  ["Graham_SC",     "Crime",       "erpo_292",       "lead",     true ],
  ["Blumenthal_CT", "Crime",       "erpo_1819",      "lead",     true ],
  ["Feinstein_CA",  "Crime",       "erpo_247",       "lead",     true ],
  ["Blumenthal_CT", "Crime",       "ethans_law",     "lead",     true ],
  ["Murphy_CT",     "Crime",       "ethans_law",     "lead",     true ],
  ["Feinstein_CA",  "Crime",       "raise_age_4275", "lead",     true ],
  ["Durbin_IL",     "Crime",       "raise_age_4275", "lead",     true ],
  ["Booker_NJ",     "Crime",       "george_floyd",   "lead",     true ],
  ["Cornyn_TX",     "Crime",       "de_escalation",  "lead",     true ],
  ["Booker_NJ",     "Crime",       "de_escalation",  "lead",     true ],
  ["Durbin_IL",     "Crime",       "fed_prison_ovs", "lead",     true ],
  ["Braun_IN",      "Crime",       "fed_prison_ovs", "lead",     true ],
  ["Durbin_IL",     "Crime",       "dom_terrorism",  "lead",     true ],
  ["Grassley_IA",   "Crime",       "cops_reauth",    "lead",     true ],
  ["Booker_NJ",     "Crime",       "cops_reauth",    "lead",     true ],
  ["Cornyn_TX",     "Crime",       "tvpra",          "lead",     true ],
  ["Klobuchar_MN",  "Crime",       "tvpra",          "lead",     true ],
  ["Hirono_HI",     "Crime",       "covid_hate",     "lead",     true ],
  ["Cassidy_LA",    "Crime",       "report_act",     "lead",     true ],
  ["Wyden_OR",      "Crime",       "report_act",     "lead",     true ],
  ["Ossoff_GA",     "Crime",       "report_act",     "lead",     true ],
  ["Markey_MA",     "Crime",       "mental_justice", "lead",     true ],

  // ── DEFICIT / CORRUPTION / TERM LIMITS ───────────────────────────────────
  ["Whitehouse_RI", "Deficit",     "disclose",       "lead",     true ],
  ["Whitehouse_RI", "Deficit",     "disclose_2939",  "lead",     true ],
  ["McConnell_KY",  "Deficit",     "disclose",       "block",    false],
  ["Ossoff_GA",     "Deficit",     "stock_ban",      "lead",     true ],
  ["Sanders_VT",    "Deficit",     "stock_ban",      "cosponsor",true ],
  ["Warren_MA",     "Deficit",     "stock_ban",      "cosponsor",true ],
  ["Schumer_NY",    "Deficit",     "stock_ban",      "block",    false],
  ["Hawley_MO",     "Deficit",     "pelosi_act_58",  "lead",     true ],
  ["Hawley_MO",     "Deficit",     "pelosi_act_693", "lead",     true ],
  ["Hawley_MO",     "Deficit",     "honest_1498",    "lead",     true ],
  ["Ossoff_GA",     "Deficit",     "honest_1498",    "lead",     true ],
  ["Merkley_OR",    "Deficit",     "ethics_1171",    "lead",     true ],
  ["Whitehouse_RI", "Deficit",     "scert_act",      "lead",     true ],
  ["Murphy_CT",     "Deficit",     "sc_ethics_2512", "lead",     true ],
  ["Whitehouse_RI", "Deficit",     "sc_ethics_2512", "lead",     true ],
  ["King_ME",       "Deficit",     "sc_ethics_325",  "lead",     true ],
  ["Whitehouse_RI", "Deficit",     "sc_term_limits", "lead",     true ],
  ["Booker_NJ",     "Deficit",     "sc_term_limits", "lead",     true ],
  ["Blumenthal_CT", "Deficit",     "no_potus_above", "lead",     true ],
  ["Warren_MA",     "Deficit",     "no_potus_above", "lead",     true ],
  ["Warren_MA",     "Deficit",     "pure_exec",      "lead",     true ],
  ["Grassley_IA",   "Deficit",     "whistleblower",  "lead",     true ],
  ["Cruz_TX",       "Deficit",     "term_lim_117",   "lead",     true ],
  ["Cruz_TX",       "Deficit",     "term_lim_118",   "lead",     true ],
  ["Cruz_TX",       "Deficit",     "term_lim_119",   "lead",     true ],
  ["Britt_AL",      "Deficit",     "term_lim_119",   "lead",     true ],

  // ── GOVERNMENT / SURVEILLANCE / PRIVACY / VOTING ─────────────────────────
  ["Wyden_OR",      "Government",  "press_act",      "lead",     true ],
  ["Lee_UT",        "Government",  "press_act",      "lead",     true ],
  ["Klobuchar_MN",  "Government",  "antitrust_online","lead",    true ],
  ["Grassley_IA",   "Government",  "antitrust_online","lead",    true ],
  ["McConnell_KY",  "Government",  "antitrust_online","block",   false],
  ["Wyden_OR",      "Government",  "fisa_reform",    "lead",     true ],
  ["Lee_UT",        "Government",  "fisa_reform",    "lead",     true ],
  ["Warner_VA",     "Government",  "fisa_risaa",     "lead",     false],
  ["Rubio_FL",      "Government",  "fisa_risaa",     "lead",     false],
  ["Klobuchar_MN",  "Government",  "ai_elections",   "lead",     true ],
  ["Hawley_MO",     "Government",  "ai_elections",   "lead",     true ],
  ["Moran_KS",      "Government",  "data_priv_4295", "lead",     true ],
  ["Cantwell_WA",   "Government",  "data_priv_4295", "lead",     true ],
  ["Markey_MA",     "Government",  "net_neutrality", "lead",     true ],
  ["Wyden_OR",      "Government",  "net_neutrality", "lead",     true ],
  ["Schumer_NY",    "Government",  "chips_act",      "lead",     true ],
  ["Cornyn_TX",     "Government",  "chips_act",      "lead",     true ],
  ["Klobuchar_MN",  "Government",  "ftv_2747",       "lead",     true ],
  ["Klobuchar_MN",  "Government",  "ftv_1_118",      "lead",     true ],
  ["Durbin_IL",     "Government",  "john_lewis_vra", "lead",     true ],
  ["Warnock_GA",    "Government",  "john_lewis_vra", "lead",     true ],
  ["Cardin_MD",     "Government",  "dem_restoration","lead",     true ],

  // ── FOREIGN POLICY ───────────────────────────────────────────────────────
  ["Graham_SC",     "FP",          "russia_sanct",   "lead",     true ],
  ["Blumenthal_CT", "FP",          "russia_sanct",   "lead",     true ],
  ["Rubio_FL",      "FP",          "uflpa",          "lead",     true ],
  ["Merkley_OR",    "FP",          "uflpa",          "lead",     true ],
  ["Lee_UT",        "FP",          "yemen_wpr",      "lead",     true ],
  ["Murphy_CT",     "FP",          "yemen_wpr",      "lead",     true ],
  ["Lee_UT",        "FP",          "saudi_arms",     "lead",     true ],
  ["Kaine_VA",      "FP",          "ndaa_fy24",      "lead",     true ],
  ["Rubio_FL",      "FP",          "ndaa_fy24",      "lead",     true ],

  // ── DRUGS ────────────────────────────────────────────────────────────────
  ["Hassan_NH",     "Drugs",       "mat_act",        "lead",     true ],
  ["Murkowski_AK",  "Drugs",       "mat_act",        "lead",     true ],
  ["Markey_MA",     "Drugs",       "mat_act",        "lead",     true ],
  ["Braun_IN",      "Drugs",       "mat_act",        "lead",     true ],
  ["Brown_OH",      "Drugs",       "fend_fentanyl",  "lead",     true ],
  ["Scott_SC",      "Drugs",       "fend_fentanyl",  "lead",     true ],
  ["Cassidy_LA",    "Drugs",       "halt_fentanyl",  "lead",     true ],
  ["Klobuchar_MN",  "Drugs",       "cara_3",         "lead",     true ],
  ["Marshall_KS",   "Drugs",       "cara_3",         "lead",     true ],
];

// ─── Senator registry key construction ────────────────────────────────────────

export function buildRegistryKey(lastName: string, stateAbbr: string): string {
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
// Maps 8 display categories to weighted combinations of 12 scoring categories.

export const UI_CATEGORY_MAP: Record<string, Array<[string, number]>> = {
  "immigration":        [["Immigration",      44]],
  "wealth-gap":         [["Housing",          52], ["Economy",   44], ["Hunger", 19], ["Social Security", 7]],
  "healthcare":         [["Healthcare",       40], ["Drugs",      7]],
  "environment":        [["Environment",      15]],
  "civil-liberties":    [["Crime",            16], ["Government", 37]],
  "corruption":         [["Deficit",          19]],
  "war-foreign-policy": [["FP",               26]],
  "gun-policy":         [["Crime",            16]],
};

export function uiCatScore(uiCatId: string, byCat: Record<string, number>): number {
  const mapping = UI_CATEGORY_MAP[uiCatId] ?? [];
  let wSum = 0, sSum = 0;
  for (const [apCat, w] of mapping) {
    if (byCat[apCat] !== undefined) { sSum += byCat[apCat] * w; wSum += w; }
  }
  return wSum > 0 ? Math.round(sSum / wSum) : 0;
}
