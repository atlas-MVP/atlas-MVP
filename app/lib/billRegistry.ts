// ─── Bill registry ────────────────────────────────────────────────────────────
// Defines every tracked bill: static info + congress.gov coordinates for
// fetching real Senate votes. Bills without a `roll` field fall back to
// `mockMemberVote` / `mockAligned` values.

export type AlignedVote = "Yea" | "Nay";

export interface BillDef {
  id: string;
  title: string;
  description: string;
  date: string;
  congress_url?: string;
  /**
   * Congress.gov coordinates for fetching real Senate roll-call data.
   * `index` selects which roll call to use when a bill has multiple
   * (0 = first/oldest, -1 = last/passage).
   * `alignedVote` is what the platform considers the "correct" vote.
   */
  roll?: {
    congress: number;
    billType: string;
    billNumber: number;
    index: number;
    alignedVote: AlignedVote;
  };
  mockMemberVote: "Yes" | "No" | "Not Voting" | "Cosponsored" | "Blocked";
  mockAligned: boolean;
}

export interface SubcategoryDef {
  id: string;
  label: string;
  bills: BillDef[];
}

export interface IssueCategoryDef {
  id: string;
  label: string;
  subcategories: SubcategoryDef[];
}

// ─── Global Issues ────────────────────────────────────────────────────────────

export const GLOBAL_ISSUES: IssueCategoryDef[] = [
  {
    id: "war-foreign-policy",
    label: "War / Foreign Policy",
    subcategories: [
      {
        id: "arms-military-sales",
        label: "Arms & Military Sales",
        bills: [
          {
            id: "block-bulldozer-sales-israel-2026",
            title: "Block bulldozer sales to Israel",
            description:
              "S.J.Res. 32 would have prohibited the transfer of armored Caterpillar D9 bulldozers to Israel, citing their documented use in civilian demolitions in Gaza. The measure failed 40–59, with 85% of Senate Democrats voting yes.",
            date: "April 15, 2026",
            congress_url:
              "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/32",
            roll: { congress: 119, billType: "sjres", billNumber: 32, index: -1, alignedVote: "Yea" },
            mockMemberVote: "No",
            mockAligned: false,
          },
          {
            id: "saudi-arms-review-2023",
            title: "Saudi Arabia Arms Sales Review Act",
            description:
              "Proposed requiring congressional approval before future arms sales to Saudi Arabia following the killing of journalist Jamal Khashoggi and the Kingdom's ongoing bombardment of Yemeni civilians.",
            date: "March 8, 2023",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "military-funding",
        label: "Military Funding",
        bills: [
          {
            id: "ndaa-fy2024",
            title: "National Defense Authorization Act FY2024",
            description:
              "Authorized $886 billion in defense spending — the largest in U.S. history — including emergency aid to Ukraine, Taiwan security provisions, and Pentagon acquisition reforms.",
            date: "December 14, 2023",
            congress_url:
              "https://www.congress.gov/bill/118th-congress/senate-bill/2226",
            roll: { congress: 118, billType: "s", billNumber: 2226, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "foreign-aid",
        label: "Foreign Aid",
        bills: [
          {
            id: "ukraine-security-assistance-2024",
            title: "Ukraine Security Assistance Act 2024",
            description:
              "Authorized $60.8 billion in emergency military and economic aid to Ukraine, sustaining defense against Russia's full-scale invasion after months of Republican-led congressional blockage.",
            date: "April 23, 2024",
            congress_url:
              "https://www.congress.gov/bill/118th-congress/house-bill/8035",
            roll: { congress: 118, billType: "hr", billNumber: 8035, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "gaza-ceasefire-resolution-2024",
            title: "Gaza Ceasefire Resolution",
            description:
              "A bipartisan resolution calling for an immediate humanitarian ceasefire in Gaza amid civilian casualties exceeding 35,000. Schumer voted against, misaligned with 67% of Americans who supported a ceasefire in polling.",
            date: "March 11, 2024",
            mockMemberVote: "No",
            mockAligned: false,
          },
        ],
      },
      {
        id: "international-security",
        label: "International Security",
        bills: [
          {
            id: "nato-commitment-resolution-2024",
            title: "NATO Commitment Resolution",
            description:
              "Reaffirmed U.S. commitment to NATO's Article 5 mutual defense clause, rejecting proposals to condition security guarantees on member states meeting defense spending targets.",
            date: "January 31, 2024",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
  {
    id: "environment",
    label: "Environment",
    subcategories: [
      {
        id: "climate",
        label: "Climate",
        bills: [
          {
            id: "inflation-reduction-act-climate-2022",
            title: "Inflation Reduction Act — Climate Provisions",
            description:
              "The largest climate investment in U.S. history, allocating $369 billion for clean energy tax credits, EV incentives, and methane reduction programs projected to cut U.S. emissions roughly 40% by 2030.",
            date: "August 7, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            roll: { congress: 117, billType: "hr", billNumber: 5376, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "paris-agreement-recommitment-2021",
            title: "Paris Agreement Recommitment Resolution",
            description:
              "A Senate resolution endorsing U.S. re-entry into the Paris Climate Accord, supporting internationally binding emissions targets after the prior administration's withdrawal in 2017.",
            date: "February 18, 2021",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "clean-energy",
        label: "Clean Energy",
        bills: [
          {
            id: "bipartisan-infrastructure-clean-energy-2021",
            title: "Infrastructure Law — Clean Energy Grid",
            description:
              "Included $73 billion to modernize the U.S. electrical grid, expand renewable transmission capacity, and fund home weatherization programs reducing energy costs for low-income families.",
            date: "August 10, 2021",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/3684",
            roll: { congress: 117, billType: "hr", billNumber: 3684, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "environmental-regulation",
        label: "Environmental Regulation",
        bills: [
          {
            id: "clean-air-standards-protection-2023",
            title: "EPA Clean Air Standards Protection",
            description:
              "Voted against a Republican resolution to overturn new EPA fine-particle pollution standards that public health experts say prevent thousands of premature deaths annually.",
            date: "May 16, 2023",
            mockMemberVote: "No",
            mockAligned: true,
          },
        ],
      },
    ],
  },
];

// ─── Domestic Issues ──────────────────────────────────────────────────────────

export const DOMESTIC_ISSUES: IssueCategoryDef[] = [
  {
    id: "healthcare",
    label: "Healthcare",
    subcategories: [
      {
        id: "drug-pricing",
        label: "Drug Pricing",
        bills: [
          {
            id: "ira-drug-pricing-2022",
            title: "IRA: Medicare Drug Price Negotiation",
            description:
              "Authorized Medicare to directly negotiate prescription drug prices for the first time in the program's history, starting with 10 high-cost drugs in 2026 — a power 89% of Americans support.",
            date: "August 7, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            // Same underlying vote as the IRA climate provisions
            roll: { congress: 117, billType: "hr", billNumber: 5376, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "insulin-cost-cap-2023",
            title: "Affordable Insulin Now Act",
            description:
              "Capped insulin out-of-pocket costs at $35/month for Medicare recipients and proposed extending the cap to private insurance, benefiting 3.3 million insulin-dependent Americans facing life-threatening rationing.",
            date: "March 24, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/4460",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "access-coverage",
        label: "Access & Coverage",
        bills: [
          {
            id: "aca-subsidy-extension-2022",
            title: "ACA Premium Subsidy Extension",
            description:
              "Extended enhanced Affordable Care Act premium subsidies through 2025, preventing a coverage cliff that would have eliminated insurance for an estimated 3 million Americans who gained coverage during the pandemic.",
            date: "August 7, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            roll: { congress: 117, billType: "hr", billNumber: 5376, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "medicare-medicaid",
        label: "Medicare & Medicaid",
        bills: [
          {
            id: "medicare-dental-vision-hearing-2023",
            title: "Medicare Dental, Vision & Hearing Act",
            description:
              "Would have expanded Medicare to include dental, vision, and hearing benefits for 60 million beneficiaries — a benefit 83% of Americans support regardless of party affiliation.",
            date: "June 22, 2023",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
  {
    id: "wealth-gap",
    label: "Wealth Gap",
    subcategories: [
      {
        id: "tax-policy",
        label: "Tax Policy",
        bills: [
          {
            id: "billionaire-minimum-tax-2023",
            title: "Billionaire Minimum Income Tax Act",
            description:
              "Proposed a 20% minimum tax on total income including unrealized capital gains for households worth over $100 million, targeting roughly 700 ultra-wealthy households who currently pay effective rates below middle-class workers.",
            date: "March 9, 2023",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "corporate-tax-restoration-2022",
            title: "Build Back Better: Corporate Tax Rate",
            description:
              "Would have raised the corporate tax rate from 21% to 26.5%, partially reversing the 2017 Tax Cuts and Jobs Act — a change 67% of Americans support according to Gallup polling.",
            date: "November 19, 2021",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "labor-wages",
        label: "Labor & Wages",
        bills: [
          {
            id: "raise-the-wage-act-2021",
            title: "Raise the Wage Act",
            description:
              "Would have gradually raised the federal minimum wage from $7.25 to $15 per hour by 2025, benefiting an estimated 27 million workers who have seen no federal increase since 2009.",
            date: "February 25, 2021",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/53",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "corporate-accountability",
        label: "Corporate Accountability",
        bills: [
          {
            id: "stock-buyback-excise-tax-2022",
            title: "Stock Buyback Excise Tax (IRA)",
            description:
              "Established a 1% excise tax on corporate stock buybacks, discouraging the practice of returning profits to shareholders instead of reinvesting in workers — supported by 65% of Americans.",
            date: "August 7, 2022",
            roll: { congress: 117, billType: "hr", billNumber: 5376, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
  {
    id: "corruption",
    label: "Corruption",
    subcategories: [
      {
        id: "campaign-finance",
        label: "Campaign Finance",
        bills: [
          {
            id: "disclose-act-2022",
            title: "DISCLOSE Act",
            description:
              "Would have required organizations spending over $10,000 on federal elections to disclose their donors, targeting dark money flooding campaigns since Citizens United — blocked by Republican filibuster despite 72% public support.",
            date: "July 13, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/443",
            roll: { congress: 117, billType: "s", billNumber: 443, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "for-the-people-act-2021",
            title: "For the People Act",
            description:
              "Comprehensive democracy reform addressing campaign finance, automatic voter registration, and gerrymandering — supported by 67% of Americans but blocked by Republican filibuster.",
            date: "June 22, 2021",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/1",
            roll: { congress: 117, billType: "hr", billNumber: 1, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "ethics-oversight",
        label: "Ethics & Oversight",
        bills: [
          {
            id: "supreme-court-ethics-act-2023",
            title: "Supreme Court Ethics Act",
            description:
              "Would have established a binding code of conduct for Supreme Court justices and required financial disclosure, following revelations that multiple justices received undisclosed gifts from billionaire donors.",
            date: "July 20, 2023",
            congress_url:
              "https://www.congress.gov/bill/118th-congress/senate-bill/359",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "government-transparency",
        label: "Government Transparency",
        bills: [
          {
            id: "stock-act-enforcement-2023",
            title: "STOCK Act Enforcement Strengthening Act",
            description:
              "Would have increased penalties for members of Congress failing to disclose stock trades and created an independent enforcement office — Schumer did not bring it to a floor vote despite 76% public support.",
            date: "September 12, 2023",
            mockMemberVote: "Not Voting",
            mockAligned: false,
          },
        ],
      },
    ],
  },
  {
    id: "civil-liberties",
    label: "Civil Liberties",
    subcategories: [
      {
        id: "voting-rights",
        label: "Voting Rights",
        bills: [
          {
            id: "john-lewis-voting-rights-2022",
            title: "John R. Lewis Voting Rights Act",
            description:
              "Would have restored key provisions of the Voting Rights Act gutted by the Supreme Court in 2013, requiring states with discriminatory histories to obtain federal approval before changing election laws.",
            date: "January 19, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/4",
            roll: { congress: 117, billType: "hr", billNumber: 4, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "freedom-to-vote-act-2022",
            title: "Freedom to Vote Act",
            description:
              "Established national standards for voter registration, expanded early voting and vote-by-mail, and banned partisan gerrymandering in congressional elections — supported by 70% of Americans.",
            date: "January 19, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/2747",
            roll: { congress: 117, billType: "s", billNumber: 2747, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "privacy-surveillance",
        label: "Privacy & Surveillance",
        bills: [
          {
            id: "fisa-reauthorization-2024",
            title: "FISA Reauthorization Act 2024",
            description:
              "Reauthorized Section 702 warrantless surveillance with limited oversight — civil liberties groups called it insufficient. Schumer voted yes, misaligned with 67% of Americans who want stronger privacy protections.",
            date: "April 19, 2024",
            congress_url:
              "https://www.congress.gov/bill/118th-congress/house-bill/7888",
            // "Nay" = oppose mass surveillance = aligned with the people
            roll: { congress: 118, billType: "hr", billNumber: 7888, index: -1, alignedVote: "Nay" },
            mockMemberVote: "Yes",
            mockAligned: false,
          },
        ],
      },
      {
        id: "civil-rights",
        label: "Civil Rights",
        bills: [
          {
            id: "equality-act-2021",
            title: "Equality Act",
            description:
              "Would have amended the Civil Rights Act to explicitly prohibit discrimination based on sexual orientation and gender identity in employment, housing, and public accommodations — supported by 70% of Americans.",
            date: "February 25, 2021",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/5",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
  {
    id: "gun-policy",
    label: "Gun Policy",
    subcategories: [
      {
        id: "background-checks",
        label: "Background Checks",
        bills: [
          {
            id: "bipartisan-safer-communities-2022",
            title: "Bipartisan Safer Communities Act",
            description:
              "Enhanced background checks for buyers under 21, closed the boyfriend loophole for domestic abusers, and funded crisis intervention programs — the most significant federal gun legislation in nearly 30 years.",
            date: "June 23, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/2938",
            roll: { congress: 117, billType: "s", billNumber: 2938, index: -1, alignedVote: "Yea" },
            mockMemberVote: "Yes",
            mockAligned: true,
          },
          {
            id: "enhanced-background-checks-2023",
            title: "Enhanced Background Checks Act",
            description:
              "Would have required a 10-day review period before firearm sales, closing the Charleston loophole that allowed a mass shooter to buy a gun before his background check was complete.",
            date: "March 9, 2023",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "assault-weapons",
        label: "Assault Weapons",
        bills: [
          {
            id: "assault-weapons-ban-2022",
            title: "Federal Assault Weapons Ban Act",
            description:
              "Would have banned the manufacture, sale, and importation of semi-automatic assault weapons and high-capacity magazines holding more than 10 rounds — supported by 63% of Americans in Gallup polling.",
            date: "July 26, 2022",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/house-bill/1808",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "red-flag-laws",
        label: "Red Flag Laws",
        bills: [
          {
            id: "federal-red-flag-law-2023",
            title: "Federal Extreme Risk Protection Act",
            description:
              "Would have established a federal framework for extreme risk protection orders, allowing courts to temporarily remove firearms from individuals deemed an imminent danger — supported by 72% of Americans.",
            date: "June 8, 2023",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
  {
    id: "immigration",
    label: "Immigration",
    subcategories: [
      {
        id: "border-security",
        label: "Border Security",
        bills: [
          {
            id: "bipartisan-border-act-2024",
            title: "Bipartisan Border Act 2024",
            description:
              "A bipartisan compromise tightening asylum standards and granting emergency deportation authority; failed after Republican senators killed it under pressure from Trump, despite Schumer's support.",
            date: "February 7, 2024",
            congress_url:
              "https://www.congress.gov/bill/118th-congress/senate-bill/4",
            // Voting to advance stricter asylum rules = not aligned; "Nay" = people's position
            roll: { congress: 118, billType: "s", billNumber: 4, index: -1, alignedVote: "Nay" },
            mockMemberVote: "Yes",
            mockAligned: false,
          },
        ],
      },
      {
        id: "pathways-citizenship",
        label: "Pathways to Citizenship",
        bills: [
          {
            id: "dream-act-2021",
            title: "Dream Act of 2021",
            description:
              "Would have provided a pathway to permanent residency and citizenship for 2.1 million undocumented immigrants brought to the U.S. as children — polling at 74% approval including 54% of Republicans.",
            date: "July 27, 2021",
            congress_url:
              "https://www.congress.gov/bill/117th-congress/senate-bill/264",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
      {
        id: "humanitarian-relief",
        label: "Humanitarian Relief",
        bills: [
          {
            id: "afghan-adjustment-act-2021",
            title: "Afghan Adjustment Act",
            description:
              "Would have provided Afghan refugees evacuated during the 2021 Taliban takeover a direct pathway to legal permanent residence, bypassing immigration courts with years-long backlogs.",
            date: "September 23, 2021",
            mockMemberVote: "Yes",
            mockAligned: true,
          },
        ],
      },
    ],
  },
];
