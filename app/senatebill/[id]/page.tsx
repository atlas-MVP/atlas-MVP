"use client";

import { useParams } from "next/navigation";
import ArticlePage from "../../components/ArticlePage";

const SENATE_VOTES = {
  "israel-arms-2026": {
    headline: "Senate vote fails 40-59 to block arms sales to Israel",
    description: "The US Senate defeated a resolution introduced by Sen. Bernie Sanders to halt new arms transfers to Israel, 40 in favor to 59 opposed. Despite the failure, the tally marked the highest level of Democratic support to date: 85% of Senate Democrats voted yes, including several members who had previously opposed similar measures. The resolution targeted a pending $8.1B package covering tank rounds, mortar shells, and guidance kits. The White House had lobbied against passage.\n\nThe vote represents a significant shift in Democratic Party sentiment on US military aid to Israel, reflecting growing concerns about civilian casualties in Gaza. Progressive Democrats who supported the measure argued that conditioning arms sales is necessary to pressure Israel toward a ceasefire, while opponents maintained that unconditional military support is essential to Israel's security.\n\nSenator Sanders, who led the effort, called the result \"a victory for human rights\" despite the defeat, noting that just a year ago such a resolution would have garnered fewer than 20 votes. The 40 votes in favor included 38 Democrats and 2 Independents, while all 59 opposing votes came from Republicans and 8 moderate Democrats.\n\nThe debate highlighted deep divisions within the Democratic caucus, with progressives pushing for accountability on human rights while centrists warned against undermining a key ally. Several senators who voted against the resolution acknowledged discomfort with Israel's conduct but argued that cutting off military aid during an active conflict was not the right approach.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 18, 2026",
    billId: "israel-arms-2026",
  },
};

export default function SenateBillPage() {
  const params = useParams();
  const id = params?.id as string;
  const bill = SENATE_VOTES[id as keyof typeof SENATE_VOTES];

  if (!bill) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0a1929 0%, #1a2332 50%, #0d1b2a 100%)",
        color: "white",
      }}>
        <div>Bill not found</div>
      </div>
    );
  }

  return <ArticlePage {...bill} />;
}
