# Location Naming Token — Site-wide Rule

**CRITICAL:** All alert headlines must follow this location naming convention.

## Rule: City vs. State in Headlines

Headlines should reference location based on city population and recognition:

### Use City Name Alone
- **Major cities** (population > 500,000)
- **Well-known cities** (college towns, state capitals, tourist destinations)

Examples:
- Chicago (pop. 2.7M) → "3 killed in drive-by shooting in **Chicago**"
- Houston (pop. 2.3M) → "2 killed at concert venue in **Houston**"
- Iowa City (pop. 75k, but home to University of Iowa) → "5 shot near campus in **Iowa City**"
- Austin, Nashville, Denver, Boston, etc. → use city name

### Use State Name
- **Small cities** (population < 500,000 and not nationally recognized)
- Cities that most Americans couldn't locate on a map

Examples:
- Shreveport, LA (pop. 180k) → "8 killed in domestic dispute in **Louisiana**"
- Tyler, TX (pop. 105k) → "incident in **Texas**"
- Bismarck, ND (pop. 73k) → "incident in **North Dakota**"

## Headline Format

```
[Number] killed, [number] injured in [brief description] in [Location]
```

**Location placement:** Always at the END of the headline

### Examples:

✅ Good:
- "8 killed, 2 injured in domestic dispute across two homes in Louisiana"
- "5 shot near University of Iowa campus in Iowa City"
- "3 killed, 7 injured in South Side drive-by shooting in Chicago"
- "2 killed, 6 injured at concert venue shooting in Houston"

❌ Bad:
- "Shreveport, LA — 8 killed, 2 injured in domestic dispute"
- "Chicago, IL — 3 killed in drive-by shooting"
- "Louisiana shooting leaves 8 dead, 2 injured"

## Implementation

When writing LiveAlert data:

```tsx
{
  text: "8 killed, 2 injured in domestic dispute across two homes in Louisiana",
  // NOT: "Shreveport, LA — 8 killed, 2 injured..."
}
```

## Population Lookup

If uncertain whether a city is nationally recognized:
1. Check population (> 500k = use city)
2. Check if it's a state capital
3. Check if it's home to major university
4. Check if it's a major tourist destination
5. When in doubt, use state name

## Exception: Multi-State Context

If the widget covers multiple states or regions, always include state:
- "3 killed in Phoenix, Arizona"
- "5 shot in Omaha, Nebraska"

This ensures geographic clarity in national or international contexts.
