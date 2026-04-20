"use client";

import { useParams } from "next/navigation";
import ArticlePage from "../../components/ArticlePage";

const SENATE_VOTES = {
  "israel-arms-2026": {
    headline: "Senate vote fails 40-59 to block arms sales to Israel",
    description: "The US Senate defeated a resolution introduced by Sen. Bernie Sanders to halt new arms transfers to Israel, 40 in favor to 59 opposed. Despite the failure, the tally marked the highest level of Democratic support to date: 85% of Senate Democrats voted yes, including several members who had previously opposed similar measures. The resolution targeted a pending $8.1B package covering tank rounds, mortar shells, and guidance kits. The White House had lobbied against passage.",
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
