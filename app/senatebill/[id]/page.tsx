"use client";

import { useParams } from "next/navigation";
import ArticlePage from "../../components/ArticlePage";

// ─── All tracked Senate bills ─────────────────────────────────────────────────

const SENATE_VOTES: Record<string, {
  headline: string;
  description: string;
  heroImage: string;
  date: string;
  billId: string;
}> = {

  // ── War / Foreign Policy ─────────────────────────────────────────────────

  // Legacy slug — keep for any existing links
  "israel-arms-2026": {
    headline: "Senate vote fails 40-59 to block bulldozer sales to Israel",
    description: "The US Senate defeated S.J.Res. 32, a resolution introduced by Sen. Bernie Sanders to halt a pending $295M transfer of armored Caterpillar D9 bulldozers to Israel. The measure failed 40-59-1, with 85% of Senate Democrats voting yes. Seven Democrats broke with their party to vote no, led by Senate Majority Leader Chuck Schumer. The White House lobbied aggressively against passage, arguing the equipment was vital to border security operations.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 15, 2026",
    billId: "israel-arms-2026",
  },

  "block-bulldozer-sales-israel-2026": {
    headline: "Senate vote fails 40-59 to block bulldozer sales to Israel",
    description: "The US Senate defeated S.J.Res. 32, a resolution introduced by Sen. Bernie Sanders to halt a pending $295M transfer of armored Caterpillar D9 bulldozers to Israel. The measure failed 40-59-1, with 85% of Senate Democrats voting yes. Seven Democrats broke with their party to vote no, led by Senate Majority Leader Chuck Schumer. The White House lobbied aggressively against passage, arguing the equipment was vital to border security operations.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 15, 2026",
    billId: "block-bulldozer-sales-israel-2026",
  },

  "saudi-arms-review-2023": {
    headline: "Senate takes up Saudi Arabia arms sales review",
    description: "The Senate considered legislation that would require congressional approval before future arms sales to Saudi Arabia, introduced in the wake of the murder of journalist Jamal Khashoggi and ongoing Saudi-led airstrikes on Yemeni civilian infrastructure. Supporters argued existing law gave the executive branch too much unilateral authority over transfers to human rights violators.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "March 8, 2023",
    billId: "saudi-arms-review-2023",
  },

  "ndaa-fy2024": {
    headline: "Senate passes $886 billion National Defense Authorization Act",
    description: "The Senate approved the largest defense authorization bill in U.S. history, funding the Pentagon through fiscal year 2024 with provisions for emergency military aid to Ukraine, new Taiwan security measures, and reforms to Pentagon acquisition processes. The bill passed with broad bipartisan support despite progressive objections to overall spending levels.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "December 14, 2023",
    billId: "ndaa-fy2024",
  },

  "ukraine-security-assistance-2024": {
    headline: "Senate passes $60.8 billion Ukraine security aid package",
    description: "After months of Republican blockage, the Senate approved emergency military and economic assistance to Ukraine to sustain its defense against Russia's full-scale invasion. The package included air defense systems, artillery ammunition, and economic support. Passage came after Senate Majority Leader Schumer forced a series of procedural votes that ultimately broke the logjam.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 23, 2024",
    billId: "ukraine-security-assistance-2024",
  },

  "gaza-ceasefire-resolution-2024": {
    headline: "Senate defeats Gaza ceasefire resolution",
    description: "The Senate rejected a bipartisan resolution calling for an immediate humanitarian ceasefire in Gaza, where Palestinian casualty figures had exceeded 35,000. The vote came as polling showed 67% of Americans supported a ceasefire. All but two Senate Democrats voted against the measure, which was championed by progressive senators including Bernie Sanders and Peter Welch.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "March 11, 2024",
    billId: "gaza-ceasefire-resolution-2024",
  },

  "nato-commitment-resolution-2024": {
    headline: "Senate reaffirms NATO Article 5 commitment",
    description: "The Senate passed a resolution reaffirming unconditional U.S. commitment to NATO's Article 5 mutual defense clause, pushing back against statements that the U.S. would encourage Russia to attack NATO members who did not meet defense spending targets. The resolution underscored Senate support for the alliance regardless of executive branch posture.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "January 31, 2024",
    billId: "nato-commitment-resolution-2024",
  },

  // ── Environment ──────────────────────────────────────────────────────────

  "inflation-reduction-act-climate-2022": {
    headline: "Senate passes largest climate investment in U.S. history",
    description: "The Senate approved the Inflation Reduction Act, allocating $369 billion for clean energy tax credits, electric vehicle incentives, and methane reduction programs — the largest single climate investment in U.S. history. Independent analyses projected the law would reduce U.S. greenhouse gas emissions roughly 40% below 2005 levels by 2030. The bill passed 51-50 with Vice President Harris casting the tiebreaking vote.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "August 7, 2022",
    billId: "inflation-reduction-act-climate-2022",
  },

  "paris-agreement-recommitment-2021": {
    headline: "Senate resolution endorses U.S. re-entry into Paris Climate Accord",
    description: "Following President Biden's executive order rejoining the Paris Agreement on his first day in office, the Senate considered a resolution formally endorsing the U.S. commitment to international climate targets. The vote reflected deep partisan divisions over climate policy, with nearly all Democrats supporting re-engagement and Republicans arguing the accord disadvantaged American industry.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "February 18, 2021",
    billId: "paris-agreement-recommitment-2021",
  },

  "bipartisan-infrastructure-clean-energy-2021": {
    headline: "Senate passes bipartisan infrastructure law with $73B for clean energy grid",
    description: "The Senate passed the Infrastructure Investment and Jobs Act with 19 Republican votes, including $73 billion to modernize the U.S. electrical grid, expand transmission capacity for renewable energy sources, and fund home weatherization programs for low-income households. The energy provisions represented the largest federal grid investment since the New Deal.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "August 10, 2021",
    billId: "bipartisan-infrastructure-clean-energy-2021",
  },

  "clean-air-standards-protection-2023": {
    headline: "Senate defeats Republican effort to overturn EPA clean air standards",
    description: "The Senate rejected a Congressional Review Act resolution that would have overturned new EPA fine-particle pollution standards tightening limits on soot and particulate matter. Public health experts testified the standards could prevent thousands of premature deaths annually and disproportionately benefit communities of color living near industrial facilities.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "May 16, 2023",
    billId: "clean-air-standards-protection-2023",
  },

  // ── Healthcare ───────────────────────────────────────────────────────────

  "ira-drug-pricing-2022": {
    headline: "Senate grants Medicare power to negotiate drug prices for first time",
    description: "The Inflation Reduction Act included a historic provision authorizing Medicare to directly negotiate prescription drug prices — a power the program had been explicitly prohibited from using since 2003. The law required negotiations to begin with 10 high-cost drugs in 2026, expanding to 20 drugs annually thereafter. Eighty-nine percent of Americans supported the policy.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "August 7, 2022",
    billId: "ira-drug-pricing-2022",
  },

  "insulin-cost-cap-2023": {
    headline: "Senate caps insulin costs at $35 for Medicare patients",
    description: "The Senate passed legislation capping out-of-pocket insulin costs at $35 per month for Medicare recipients, after years of advocacy from diabetes patient groups documenting cases of rationing and preventable deaths. A provision extending the cap to private insurance plans was struck on a procedural vote. An estimated 3.3 million Americans rely on insulin to survive.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "March 24, 2022",
    billId: "insulin-cost-cap-2023",
  },

  "aca-subsidy-extension-2022": {
    headline: "Senate extends ACA premium subsidies, preventing coverage cliff",
    description: "As part of the Inflation Reduction Act, the Senate extended enhanced Affordable Care Act premium subsidies through 2025 that had been enacted during the pandemic. Without the extension, an estimated 3 million Americans would have faced sharply higher premiums or lost coverage entirely. The subsidies had reduced the uninsured rate to a historic low.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "August 7, 2022",
    billId: "aca-subsidy-extension-2022",
  },

  "medicare-dental-vision-hearing-2023": {
    headline: "Senate considers Medicare dental, vision, and hearing expansion",
    description: "The Senate debated legislation that would expand Medicare to include dental, vision, and hearing benefits for 60 million beneficiaries — benefits excluded since Medicare's creation in 1965. Eighty-three percent of Americans support the expansion in polling, including large majorities of Republicans. The bill stalled amid opposition from the dental industry and deficit concerns.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "June 22, 2023",
    billId: "medicare-dental-vision-hearing-2023",
  },

  // ── Wealth Gap ───────────────────────────────────────────────────────────

  "billionaire-minimum-tax-2023": {
    headline: "Senate takes up Billionaire Minimum Income Tax Act",
    description: "The Senate considered a proposal to impose a 20% minimum tax on total income including unrealized capital gains for households worth more than $100 million. Proponents argued the measure would ensure roughly 700 ultra-wealthy households pay an effective tax rate comparable to middle-class workers, who cannot defer taxes on wages. The bill attracted 67% public support in polling.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "March 9, 2023",
    billId: "billionaire-minimum-tax-2023",
  },

  "corporate-tax-restoration-2022": {
    headline: "Senate votes on restoring corporate tax rate in Build Back Better",
    description: "The Senate considered provisions in the Build Back Better Act that would have raised the corporate tax rate from 21% to 26.5%, partially reversing the 2017 Tax Cuts and Jobs Act that slashed it from 35%. Independent economists estimated the increase would generate $858 billion in revenue over a decade while still leaving the U.S. corporate rate below the OECD average.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "November 19, 2021",
    billId: "corporate-tax-restoration-2022",
  },

  "raise-the-wage-act-2021": {
    headline: "Senate fails to pass $15 minimum wage",
    description: "The Senate parliamentarian ruled that a federal $15 minimum wage provision could not be included in the American Rescue Plan under budget reconciliation rules, blocking a standalone vote. The Raise the Wage Act would have phased the federal minimum wage to $15 by 2025. The federal minimum wage has not increased since 2009 — the longest period without a raise in the law's history.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "February 25, 2021",
    billId: "raise-the-wage-act-2021",
  },

  "stock-buyback-excise-tax-2022": {
    headline: "Senate establishes 1% tax on corporate stock buybacks",
    description: "As part of the Inflation Reduction Act, the Senate established a 1% excise tax on corporate stock buybacks — a measure economists said would discourage returning profits to shareholders rather than reinvesting in workers or production. Companies spent over $1.2 trillion on buybacks in 2022. Sixty-five percent of Americans support taxing buybacks more heavily.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "August 7, 2022",
    billId: "stock-buyback-excise-tax-2022",
  },

  // ── Corruption ───────────────────────────────────────────────────────────

  "disclose-act-2022": {
    headline: "Senate Republicans block DISCLOSE Act for fourth time",
    description: "Senate Republicans used the filibuster to block the DISCLOSE Act, which would have required all organizations spending more than $10,000 on federal elections to publicly disclose their donors within 24 hours. The bill targeted the surge in anonymous dark money contributions following Citizens United. Seventy-two percent of Americans support donor disclosure requirements.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "July 13, 2022",
    billId: "disclose-act-2022",
  },

  "for-the-people-act-2021": {
    headline: "Senate Republicans filibuster For the People Act democracy reform",
    description: "The Senate's attempt to pass the For the People Act — the most sweeping democracy reform legislation in a generation — was blocked by a Republican filibuster. The bill would have established automatic voter registration, created independent redistricting commissions, mandated campaign finance disclosure, and banned partisan gerrymandering. Sixty-seven percent of Americans supported the bill.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "June 22, 2021",
    billId: "for-the-people-act-2021",
  },

  "supreme-court-ethics-act-2023": {
    headline: "Senate votes on Supreme Court ethics and transparency reform",
    description: "The Senate considered legislation establishing a binding code of conduct for Supreme Court justices and requiring financial disclosure of gifts, travel, and outside income. The bill followed reporting revealing that Justice Clarence Thomas had received millions of dollars in undisclosed gifts from Republican megadonor Harlan Crow over two decades. Eighty percent of Americans support ethics reform for the Court.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "July 20, 2023",
    billId: "supreme-court-ethics-act-2023",
  },

  "stock-act-enforcement-2023": {
    headline: "Senators push for stronger STOCK Act enforcement amid trading scandal",
    description: "Following reporting on members of Congress trading stocks in industries they regulate, senators introduced legislation to strengthen the STOCK Act with higher penalties for disclosure failures and an independent enforcement office. The Office of Government Ethics had documented over 3,000 violation instances. Seventy-six percent of Americans support stronger trading restrictions for lawmakers.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "September 12, 2023",
    billId: "stock-act-enforcement-2023",
  },

  // ── Civil Liberties ──────────────────────────────────────────────────────

  "john-lewis-voting-rights-2022": {
    headline: "Senate Republicans block John Lewis Voting Rights Act",
    description: "Senate Republicans filibustered the John R. Lewis Voting Rights Advancement Act, which would have restored federal preclearance requirements for states with histories of voting discrimination — a protection gutted by the Supreme Court's 2013 Shelby County decision. Civil rights organizations documented over 400 restrictive voting laws introduced in 49 states following the ruling.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "January 19, 2022",
    billId: "john-lewis-voting-rights-2022",
  },

  "freedom-to-vote-act-2022": {
    headline: "Senate Republicans filibuster Freedom to Vote Act",
    description: "The Senate failed to advance the Freedom to Vote Act, which would have established national standards for voter registration and access, expanded early voting and vote-by-mail, and banned partisan gerrymandering in congressional elections. Supporters argued the bill was a direct response to a wave of state-level voting restrictions passed after the 2020 election. Seventy percent of Americans support the bill's core provisions.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "January 19, 2022",
    billId: "freedom-to-vote-act-2022",
  },

  "fisa-reauthorization-2024": {
    headline: "Senate reauthorizes warrantless surveillance program over civil liberties objections",
    description: "The Senate reauthorized Section 702 of the Foreign Intelligence Surveillance Act, permitting the NSA to collect communications of foreign nationals without a warrant, with limited new oversight provisions that civil liberties advocates called inadequate. Internal government audits had revealed thousands of improper queries of American communications. Sixty-seven percent of Americans say they want stronger protections against government surveillance.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 19, 2024",
    billId: "fisa-reauthorization-2024",
  },

  "equality-act-2021": {
    headline: "Senate considers Equality Act to ban LGBTQ+ discrimination",
    description: "The Senate considered the Equality Act, which would have amended the Civil Rights Act of 1964 to explicitly prohibit discrimination based on sexual orientation and gender identity in employment, housing, education, credit, and public accommodations. The bill passed the House but stalled in the Senate. Seventy percent of Americans support legal protections for LGBTQ+ individuals.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "February 25, 2021",
    billId: "equality-act-2021",
  },

  // ── Gun Policy ───────────────────────────────────────────────────────────

  "bipartisan-safer-communities-2022": {
    headline: "Senate passes first major gun legislation in nearly 30 years",
    description: "The Senate passed the Bipartisan Safer Communities Act with 65 votes, the most significant federal gun safety legislation since 1993. The law enhanced background checks for buyers under 21, closed the boyfriend loophole, funded state crisis intervention programs, and clarified licensing requirements for gun dealers. Fifteen Republican senators voted in favor.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "June 23, 2022",
    billId: "bipartisan-safer-communities-2022",
  },

  "enhanced-background-checks-2023": {
    headline: "Senate votes on 10-day background check waiting period",
    description: "The Senate considered legislation that would require a minimum 10-day review period before any firearm sale could proceed — closing the Charleston loophole, named after the 2015 church shooting where the gunman obtained a weapon because his background check was not completed within the existing 3-day window. Over 3,500 people have received firearms through the loophole since 2015.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "March 9, 2023",
    billId: "enhanced-background-checks-2023",
  },

  "assault-weapons-ban-2022": {
    headline: "Senate fails to advance Federal Assault Weapons Ban",
    description: "The Senate did not advance the Federal Assault Weapons Ban Act, which would have prohibited the manufacture, sale, and importation of semi-automatic assault weapons and high-capacity magazines holding more than 10 rounds. The bill came in response to the Uvalde school shooting. Sixty-three percent of Americans support an assault weapons ban according to Gallup.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "July 26, 2022",
    billId: "assault-weapons-ban-2022",
  },

  "federal-red-flag-law-2023": {
    headline: "Senate considers federal extreme risk protection order framework",
    description: "The Senate debated legislation establishing a federal framework for extreme risk protection orders — red flag laws — that would allow courts to temporarily remove firearms from individuals a judge determines pose an imminent danger to themselves or others. Nineteen states have enacted such laws, and studies associate them with reductions in firearm suicide rates. Seventy-two percent of Americans support red flag laws.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "June 8, 2023",
    billId: "federal-red-flag-law-2023",
  },

  // ── Immigration ──────────────────────────────────────────────────────────

  "bipartisan-border-act-2024": {
    headline: "Senate bipartisan border deal collapses under Trump pressure",
    description: "A rare bipartisan border security bill negotiated by Senators Lankford (R-OK), Murphy (D-CT), and Sinema (I-AZ) collapsed after former President Trump publicly urged Republicans to reject it, arguing a border deal would benefit President Biden politically. The bill would have instituted the most significant asylum restrictions in decades while providing billions in border security funding.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "February 7, 2024",
    billId: "bipartisan-border-act-2024",
  },

  "dream-act-2021": {
    headline: "Senate blocks Dream Act pathway for undocumented immigrants raised in U.S.",
    description: "The Senate failed to pass the Dream Act of 2021, which would have provided a pathway to legal permanent residence and eventual citizenship for approximately 2.1 million undocumented immigrants brought to the U.S. as children. Polling showed 74% approval for the Dream Act, including 54% among Republicans, but the measure fell short of the 60 votes needed to overcome a filibuster.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "July 27, 2021",
    billId: "dream-act-2021",
  },

  "afghan-adjustment-act-2021": {
    headline: "Senate considers Afghan refugee adjustment act",
    description: "Following the U.S. withdrawal from Afghanistan and the Taliban takeover in August 2021, the Senate considered legislation providing Afghan refugees who were evacuated a direct pathway to legal permanent residence. Approximately 76,000 Afghans were evacuated under Operation Allies Welcome. Without legislation, many faced uncertain legal status despite having assisted U.S. military and diplomatic operations.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "September 23, 2021",
    billId: "afghan-adjustment-act-2021",
  },
};

export default function SenateBillPage() {
  const params = useParams();
  const id = params?.id as string;
  const bill = SENATE_VOTES[id];

  if (!bill) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%)",
        color: "white",
        fontFamily: "monospace",
        fontSize: 13,
        letterSpacing: "0.1em",
        opacity: 0.4,
      }}>
        bill not found
      </div>
    );
  }

  return <ArticlePage {...bill} />;
}
