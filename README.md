# Elevation of Privilege

A web-based implementation of the security threat modeling card game created by Microsoft.

---

## How to Play

### Setup

**Before you start:**
1. Draw a diagram of the system you want to threat model before dealing the cards
2. Deal the deck to 3–6 players
3. Play starts with the **3 of Tampering**

### Gameplay

**Taking Turns:**
- Play clockwise
- Each player in turn continues using the suit if they have a card in that suit
- If the player doesn't have a card from that suit, they can use another suit
- Each round is won by the **highest card** played in the suit that was led
- **Exception:** Elevation of Privilege (EoP) cards are **trumps** and win even with lower values

**Playing a Card:**
1. Read the card aloud
2. Announce your threat
3. Record the threat
4. If you can't link the threat to the system, play proceeds without recording

**Between Hands:**
- The winner of a hand selects the card (and suit) to lead the next hand
- Take a few minutes between hands to think about threats

### Scoring

**Points:**
- **+1 point** for identifying a threat on your card
- **+1 point** for taking the trick

**What Makes a Good Threat:**
- Threats should be **clearly articulated**, **testable**, and **addressable**
- In case of argument, ask: *"Would we take an actionable bug, feature request, or design change for that?"*
  - If **yes** → it's a real threat
  - This focuses discussion on actionable threats
- Questions starting with *"There's a way"* should be read as *"There's a way…and here's how…"*
- Questions starting with *"Your code"* should be read as *"The code we're collectively creating…and here's how"*

### Special Cards

**Trump Cards (EoP):**
- Elevation of Privilege cards take the trick even with lower values than the suit led

**Open Threat Cards (Aces):**
- The **ace of each suit** is an open threat card
- When played, identify a threat **not listed** on another card
- Use questions on threat cards to help with aces

### Winning

When all cards have been played, **whoever has the most points wins!**

**Remember to have fun!** 🎮

---

## Optional Variants

Want to customize your game? Try these variants:

- **Card Passing:** Pass cards after the third trick if you can't tie them to the system
- **Bonus Points:** Double all points and give **+1 point** for identifying threats on other players' cards
- **Riffing:** Players can build on threats and earn **+1 point** per additional threat
- **Time Limit:** Limit riffing to **60 seconds max**
- **Visual Mapping:** Mark up the diagram where each threat occurs

---

## Acknowledgments

Thanks to **Laurie Williams** for inspiration.

Original game created by **Microsoft**.
