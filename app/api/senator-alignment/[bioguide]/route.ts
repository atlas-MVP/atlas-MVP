import { NextRequest, NextResponse } from "next/server";

// ─── Core types ───────────────────────────────────────────────────────────────

export interface BillRecord {
  id: string;           // URL slug → /senatebill/[id]
  title: string;
  description: string;  // 1-2 sentence hover text
  memberVote: "Yes" | "No" | "Not Voting" | "Cosponsored" | "Blocked";
  aligned: boolean;
  weight: number;       // 1.0 default; 1.5 for landmark bills
  date: string;
  congress_url?: string;
}

export interface SubcategoryScore {
  id: string;
  label: string;
  score: number;        // 0–100
  bills: BillRecord[];
}

export interface IssueCategoryScore {
  id: string;
  label: string;
  score: number;        // 0–100
  subcategories: SubcategoryScore[];
}

export interface SenatorScorecard {
  bioguide: string;
  name: string;
  globalIssues: IssueCategoryScore[];    // War/Foreign Policy, Environment
  domesticIssues: IssueCategoryScore[];  // Healthcare → Immigration
}

// ─── Mock scorecard — Chuck Schumer (S000148) ─────────────────────────────────

const SCHUMER: SenatorScorecard = {
  bioguide: "S000148",
  name: "Chuck Schumer",
  globalIssues: [
    {
      id: "war-foreign-policy",
      label: "War / Foreign Policy",
      score: 58,
      subcategories: [
        {
          id: "arms-military-sales",
          label: "Arms & Military Sales",
          score: 38,
          bills: [
            {
              id: "block-bulldozer-sales-israel-2026",
              title: "Block bulldozer sales to Israel",
              description: "S.J.Res. 32 would have prohibited the transfer of armored Caterpillar D9 bulldozers to Israel, citing their documented use in civilian demolitions in Gaza. The measure failed 40–59, with 85% of Senate Democrats voting yes.",
              memberVote: "No",
              aligned: false,
              weight: 1.5,
              date: "April 15, 2026",
              congress_url: "https://www.congress.gov/bill/119th-congress/senate-joint-resolution/32",
            },
            {
              id: "saudi-arms-review-2023",
              title: "Saudi Arabia Arms Sales Review Act",
              description: "Proposed requiring congressional approval before future arms sales to Saudi Arabia following the killing of journalist Jamal Khashoggi and the Kingdom's ongoing bombardment of Yemeni civilians.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "March 8, 2023",
            },
          ],
        },
        {
          id: "military-funding",
          label: "Military Funding",
          score: 65,
          bills: [
            {
              id: "ndaa-fy2024",
              title: "National Defense Authorization Act FY2024",
              description: "Authorized $886 billion in defense spending — the largest in U.S. history — including emergency aid to Ukraine, Taiwan security provisions, and Pentagon acquisition reforms.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "December 14, 2023",
              congress_url: "https://www.congress.gov/bill/118th-congress/senate-bill/2226",
            },
          ],
        },
        {
          id: "foreign-aid",
          label: "Foreign Aid",
          score: 62,
          bills: [
            {
              id: "ukraine-security-assistance-2024",
              title: "Ukraine Security Assistance Act 2024",
              description: "Authorized $60.8 billion in emergency military and economic aid to Ukraine, sustaining defense against Russia's full-scale invasion after months of Republican-led congressional blockage.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "April 23, 2024",
              congress_url: "https://www.congress.gov/bill/118th-congress/house-bill/8035",
            },
            {
              id: "gaza-ceasefire-resolution-2024",
              title: "Gaza Ceasefire Resolution",
              description: "A bipartisan resolution calling for an immediate humanitarian ceasefire in Gaza amid civilian casualties exceeding 35,000. Schumer voted against, misaligned with 67% of Americans who supported a ceasefire in polling.",
              memberVote: "No",
              aligned: false,
              weight: 1.0,
              date: "March 11, 2024",
            },
          ],
        },
        {
          id: "international-security",
          label: "International Security",
          score: 78,
          bills: [
            {
              id: "nato-commitment-resolution-2024",
              title: "NATO Commitment Resolution",
              description: "Reaffirmed U.S. commitment to NATO's Article 5 mutual defense clause, rejecting proposals to condition security guarantees on member states meeting defense spending targets.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "January 31, 2024",
            },
          ],
        },
      ],
    },
    {
      id: "environment",
      label: "Environment",
      score: 87,
      subcategories: [
        {
          id: "climate",
          label: "Climate",
          score: 93,
          bills: [
            {
              id: "inflation-reduction-act-climate-2022",
              title: "Inflation Reduction Act — Climate Provisions",
              description: "The largest climate investment in U.S. history, allocating $369 billion for clean energy tax credits, EV incentives, and methane reduction programs projected to cut U.S. emissions roughly 40% by 2030.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "August 7, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            },
            {
              id: "paris-agreement-recommitment-2021",
              title: "Paris Agreement Recommitment Resolution",
              description: "A Senate resolution endorsing U.S. re-entry into the Paris Climate Accord, supporting internationally binding emissions targets after the prior administration's withdrawal in 2017.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "February 18, 2021",
            },
          ],
        },
        {
          id: "clean-energy",
          label: "Clean Energy",
          score: 88,
          bills: [
            {
              id: "bipartisan-infrastructure-clean-energy-2021",
              title: "Infrastructure Law — Clean Energy Grid",
              description: "Included $73 billion to modernize the U.S. electrical grid, expand renewable transmission capacity, and fund home weatherization programs reducing energy costs for low-income families.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "August 10, 2021",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/3684",
            },
          ],
        },
        {
          id: "environmental-regulation",
          label: "Environmental Regulation",
          score: 80,
          bills: [
            {
              id: "clean-air-standards-protection-2023",
              title: "EPA Clean Air Standards Protection",
              description: "Voted against a Republican resolution to overturn new EPA fine-particle pollution standards that public health experts say prevent thousands of premature deaths annually.",
              memberVote: "No",
              aligned: true,
              weight: 1.0,
              date: "May 16, 2023",
            },
          ],
        },
      ],
    },
  ],
  domesticIssues: [
    {
      id: "healthcare",
      label: "Healthcare",
      score: 92,
      subcategories: [
        {
          id: "drug-pricing",
          label: "Drug Pricing",
          score: 97,
          bills: [
            {
              id: "ira-drug-pricing-2022",
              title: "IRA: Medicare Drug Price Negotiation",
              description: "Authorized Medicare to directly negotiate prescription drug prices for the first time in the program's history, starting with 10 high-cost drugs in 2026 — a power 89% of Americans support.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "August 7, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            },
            {
              id: "insulin-cost-cap-2023",
              title: "Affordable Insulin Now Act",
              description: "Capped insulin out-of-pocket costs at $35/month for Medicare recipients and proposed extending the cap to private insurance, benefiting 3.3 million insulin-dependent Americans facing life-threatening rationing.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "March 24, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/4460",
            },
          ],
        },
        {
          id: "access-coverage",
          label: "Access & Coverage",
          score: 88,
          bills: [
            {
              id: "aca-subsidy-extension-2022",
              title: "ACA Premium Subsidy Extension",
              description: "Extended enhanced Affordable Care Act premium subsidies through 2025, preventing a coverage cliff that would have eliminated insurance for an estimated 3 million Americans who gained coverage during the pandemic.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "August 7, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/5376",
            },
          ],
        },
        {
          id: "medicare-medicaid",
          label: "Medicare & Medicaid",
          score: 90,
          bills: [
            {
              id: "medicare-dental-vision-hearing-2023",
              title: "Medicare Dental, Vision & Hearing Act",
              description: "Would have expanded Medicare to include dental, vision, and hearing benefits for 60 million beneficiaries — a benefit 83% of Americans support regardless of party affiliation.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "June 22, 2023",
            },
          ],
        },
      ],
    },
    {
      id: "wealth-gap",
      label: "Wealth Gap",
      score: 85,
      subcategories: [
        {
          id: "tax-policy",
          label: "Tax Policy",
          score: 80,
          bills: [
            {
              id: "billionaire-minimum-tax-2023",
              title: "Billionaire Minimum Income Tax Act",
              description: "Proposed a 20% minimum tax on total income including unrealized capital gains for households worth over $100 million, targeting roughly 700 ultra-wealthy households who currently pay effective rates below middle-class workers.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "March 9, 2023",
            },
            {
              id: "corporate-tax-restoration-2022",
              title: "Build Back Better: Corporate Tax Rate",
              description: "Would have raised the corporate tax rate from 21% to 26.5%, partially reversing the 2017 Tax Cuts and Jobs Act — a change 67% of Americans support according to Gallup polling.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "November 19, 2021",
            },
          ],
        },
        {
          id: "labor-wages",
          label: "Labor & Wages",
          score: 95,
          bills: [
            {
              id: "raise-the-wage-act-2021",
              title: "Raise the Wage Act",
              description: "Would have gradually raised the federal minimum wage from $7.25 to $15 per hour by 2025, benefiting an estimated 27 million workers who have seen no federal increase since 2009.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "February 25, 2021",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/53",
            },
          ],
        },
        {
          id: "corporate-accountability",
          label: "Corporate Accountability",
          score: 80,
          bills: [
            {
              id: "stock-buyback-excise-tax-2022",
              title: "Stock Buyback Excise Tax (IRA)",
              description: "Established a 1% excise tax on corporate stock buybacks, discouraging the practice of returning profits to shareholders instead of reinvesting in workers — supported by 65% of Americans.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "August 7, 2022",
            },
          ],
        },
      ],
    },
    {
      id: "corruption",
      label: "Corruption",
      score: 78,
      subcategories: [
        {
          id: "campaign-finance",
          label: "Campaign Finance",
          score: 90,
          bills: [
            {
              id: "disclose-act-2022",
              title: "DISCLOSE Act",
              description: "Would have required organizations spending over $10,000 on federal elections to disclose their donors, targeting dark money flooding campaigns since Citizens United — blocked by Republican filibuster despite 72% public support.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "July 13, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/443",
            },
            {
              id: "for-the-people-act-2021",
              title: "For the People Act",
              description: "Comprehensive democracy reform addressing campaign finance, automatic voter registration, and gerrymandering — supported by 67% of Americans but blocked by Republican filibuster.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "June 22, 2021",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/1",
            },
          ],
        },
        {
          id: "ethics-oversight",
          label: "Ethics & Oversight",
          score: 82,
          bills: [
            {
              id: "supreme-court-ethics-act-2023",
              title: "Supreme Court Ethics Act",
              description: "Would have established a binding code of conduct for Supreme Court justices and required financial disclosure, following revelations that multiple justices received undisclosed gifts from billionaire donors.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "July 20, 2023",
              congress_url: "https://www.congress.gov/bill/118th-congress/senate-bill/359",
            },
          ],
        },
        {
          id: "government-transparency",
          label: "Government Transparency",
          score: 62,
          bills: [
            {
              id: "stock-act-enforcement-2023",
              title: "STOCK Act Enforcement Strengthening Act",
              description: "Would have increased penalties for members of Congress failing to disclose stock trades and created an independent enforcement office — Schumer did not bring it to a floor vote despite 76% public support.",
              memberVote: "Not Voting",
              aligned: false,
              weight: 1.0,
              date: "September 12, 2023",
            },
          ],
        },
      ],
    },
    {
      id: "civil-liberties",
      label: "Civil Liberties",
      score: 82,
      subcategories: [
        {
          id: "voting-rights",
          label: "Voting Rights",
          score: 97,
          bills: [
            {
              id: "john-lewis-voting-rights-2022",
              title: "John R. Lewis Voting Rights Act",
              description: "Would have restored key provisions of the Voting Rights Act gutted by the Supreme Court in 2013, requiring states with discriminatory histories to obtain federal approval before changing election laws.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "January 19, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/4",
            },
            {
              id: "freedom-to-vote-act-2022",
              title: "Freedom to Vote Act",
              description: "Established national standards for voter registration, expanded early voting and vote-by-mail, and banned partisan gerrymandering in congressional elections — supported by 70% of Americans.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "January 19, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/2747",
            },
          ],
        },
        {
          id: "privacy-surveillance",
          label: "Privacy & Surveillance",
          score: 42,
          bills: [
            {
              id: "fisa-reauthorization-2024",
              title: "FISA Reauthorization Act 2024",
              description: "Reauthorized Section 702 warrantless surveillance with limited oversight — civil liberties groups called it insufficient. Schumer voted yes, misaligned with 67% of Americans who want stronger privacy protections.",
              memberVote: "Yes",
              aligned: false,
              weight: 1.0,
              date: "April 19, 2024",
              congress_url: "https://www.congress.gov/bill/118th-congress/house-bill/7888",
            },
          ],
        },
        {
          id: "civil-rights",
          label: "Civil Rights",
          score: 100,
          bills: [
            {
              id: "equality-act-2021",
              title: "Equality Act",
              description: "Would have amended the Civil Rights Act to explicitly prohibit discrimination based on sexual orientation and gender identity in employment, housing, and public accommodations — supported by 70% of Americans.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "February 25, 2021",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/5",
            },
          ],
        },
      ],
    },
    {
      id: "gun-policy",
      label: "Gun Policy",
      score: 93,
      subcategories: [
        {
          id: "background-checks",
          label: "Background Checks",
          score: 95,
          bills: [
            {
              id: "bipartisan-safer-communities-2022",
              title: "Bipartisan Safer Communities Act",
              description: "Enhanced background checks for buyers under 21, closed the boyfriend loophole for domestic abusers, and funded crisis intervention programs — the most significant federal gun legislation in nearly 30 years.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "June 23, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/2938",
            },
            {
              id: "enhanced-background-checks-2023",
              title: "Enhanced Background Checks Act",
              description: "Would have required a 10-day review period before firearm sales, closing the Charleston loophole that allowed a mass shooter to buy a gun before his background check was complete.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "March 9, 2023",
            },
          ],
        },
        {
          id: "assault-weapons",
          label: "Assault Weapons",
          score: 95,
          bills: [
            {
              id: "assault-weapons-ban-2022",
              title: "Federal Assault Weapons Ban Act",
              description: "Would have banned the manufacture, sale, and importation of semi-automatic assault weapons and high-capacity magazines holding more than 10 rounds — supported by 63% of Americans in Gallup polling.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "July 26, 2022",
              congress_url: "https://www.congress.gov/bill/117th-congress/house-bill/1808",
            },
          ],
        },
        {
          id: "red-flag-laws",
          label: "Red Flag Laws",
          score: 88,
          bills: [
            {
              id: "federal-red-flag-law-2023",
              title: "Federal Extreme Risk Protection Act",
              description: "Would have established a federal framework for extreme risk protection orders, allowing courts to temporarily remove firearms from individuals deemed an imminent danger — supported by 72% of Americans.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "June 8, 2023",
            },
          ],
        },
      ],
    },
    {
      id: "immigration",
      label: "Immigration",
      score: 74,
      subcategories: [
        {
          id: "border-security",
          label: "Border Security",
          score: 65,
          bills: [
            {
              id: "bipartisan-border-act-2024",
              title: "Bipartisan Border Act 2024",
              description: "A bipartisan compromise tightening asylum standards and granting emergency deportation authority; failed after Republican senators killed it under pressure from Trump, despite Schumer's support.",
              memberVote: "Yes",
              aligned: false,
              weight: 1.0,
              date: "February 7, 2024",
              congress_url: "https://www.congress.gov/bill/118th-congress/senate-bill/4",
            },
          ],
        },
        {
          id: "pathways-citizenship",
          label: "Pathways to Citizenship",
          score: 88,
          bills: [
            {
              id: "dream-act-2021",
              title: "Dream Act of 2021",
              description: "Would have provided a pathway to permanent residency and citizenship for 2.1 million undocumented immigrants brought to the U.S. as children — polling at 74% approval including 54% of Republicans.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.5,
              date: "July 27, 2021",
              congress_url: "https://www.congress.gov/bill/117th-congress/senate-bill/264",
            },
          ],
        },
        {
          id: "humanitarian-relief",
          label: "Humanitarian Relief",
          score: 72,
          bills: [
            {
              id: "afghan-adjustment-act-2021",
              title: "Afghan Adjustment Act",
              description: "Would have provided Afghan refugees evacuated during the 2021 Taliban takeover a direct pathway to legal permanent residence, bypassing immigration courts with years-long backlogs.",
              memberVote: "Yes",
              aligned: true,
              weight: 1.0,
              date: "September 23, 2021",
            },
          ],
        },
      ],
    },
  ],
};

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bioguide: string }> }
) {
  const { bioguide } = await params;

  if (bioguide === "S000148") {
    return NextResponse.json(SCHUMER, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  }

  return NextResponse.json({ error: "Senator not found" }, { status: 404 });
}
