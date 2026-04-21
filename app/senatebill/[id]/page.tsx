"use client";

import { useParams } from "next/navigation";
import ArticlePage from "../../components/ArticlePage";

const SENATE_VOTES = {
  "israel-arms-2026": {
    headline: "Senate vote fails 40-59 to block bulldozer sales to Israel",
    description: "The US Senate defeated S.J.Res. 32, a resolution introduced by Sen. Bernie Sanders to halt a pending $295M transfer of armored Caterpillar D9 bulldozers to Israel. The measure failed 40-59-1 (one not voting: Sen. Cynthia Lummis). Despite the defeat, the tally represented unprecedented Democratic unity: 85% of Senate Democrats voted yes, including several members who had previously opposed similar measures. Seven Democrats broke with their party to vote no, led by Senate Majority Leader Chuck Schumer. The White House had lobbied aggressively against passage, arguing the equipment was vital to border security operations.",
    heroImage: "/bernie-sanders-senate.jpg",
    date: "April 15, 2026",
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
