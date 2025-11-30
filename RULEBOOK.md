# **Hungry Ghost**

**Hungry Ghost** is a game of karma, reincarnation, and enlightenment. Players traverse multiple lives to purify themselves of Delusion and gain Insight.

### **Objective**

To achieve Nirvana and break the cycle of Samsara. A player wins immediately if they **die while having 7 Insight**.

## **The Board & Stats**

Each player tracks the following on their board:

* **Merit:** Karmic balance (-5 to +5). Starts at 0.  
* **Life:** Hearts collected from the aging track. Your 👤 head starts at position 0 and moves through positions 1-5, collecting hearts along the way.
* **Dana:** Currency / material resource used to perform Good Deeds or extend survival on the aging track.  
* **Delusion:** Obscurations to clarity. Starts at 30. Must be reduced to 0 before Insight can be gained.  
* **Insight:** Spiritual understanding. Gained only after Delusion is cleared. Resets to 0 upon death.

### **Locations (Human Realm)**

* **Cave:** Solitary meditation (High efficiency).  
* **Forest:** Nature meditation (Medium efficiency).  
* **Town:** Social hub for Alms and Deeds.  
* **Temple:** Group meditation and Ordination (becoming ordained as a Monk).

## **Turn Structure**

A turn in the Human Realm consists of three phases: **Morning**, **Afternoon**, and **Evening**.

### **1. Morning & Afternoon (Action Phases)**

In each of these two phases, the active player performs **one** voluntary action:

* **Move:** Travel to an adjacent location.  
* **Meditate:** (Requires **Meditator** status). Reduces Delusion or gains Insight (if Delusion is 0).  
  * *Temple:* -1 Delusion (additional -1 per other player present).  
  * *Forest:* -1 Delusion.  
  * *Cave:* -2 Delusion.  
* **Good Deed:** Pay **1 Dana** to gain **+1 Merit**.  
  * *Restriction:* Must be in Town or sharing a location with another player.  
  * *Effect:* If in Town, Dana goes to the box. If with players, the Dana goes to a player.  
* **Bad Deed:** Lose **Merit equal to Dana stolen**.
  * *Restriction:* Must be in Town or sharing a location with another player.
  * *Effect:* Steal 1 Dana from *every* other player at your location. If in Town, steal an additional +1 Dana from the bank (game box). Lose 1 Merit for each Dana stolen.  
* **Alms:** (Requires **Monk** status). Gain **+1 Dana** from the town.  
  * *Restriction:* Morning phase only. Must be in Town.  
* **Skip:** Pass the time and proceed to the next phase.

### **2. Evening (The Ritual)**

The day ends and aging takes its toll. Players must choose one of three options:

**Age:** Move your 👤 head one position forward on the aging track. If you encounter a heart, collect it (gain +1 Life). Available when not at end of track (position < 5).

**Extend:** Place 1 Dana coin at your current position, then move your head forward. Only available when you have no hearts left to collect (position ≥ 5) and have Dana to spend.

**Die:** Accept death and reincarnate. Only available when at the end of the aging track with no Dana to extend life.

*Note: The aging track represents your journey through life. You start at position 0 with hearts waiting at positions 1-5. Dana can extend survival but only after all hearts are collected.*

## **Player States & Passive Effects**

* **Monk:** Gained by ordaining at the **Temple**. Allows the **Alms** action.  
* **Meditator:** Prerequisite for Meditating. Learned automatically if you end a move in the same location as a **Teacher**.  
* **Teacher:** (Reincarnated from Heaven).
  * **Compulsion:** Automatically teaches players when entering the **Temple** or when other players enter the Teacher's location. Only teaches players who are not already **Meditators**. Gains **+1 Merit** per player taught.
* **Greedy:** (Reincarnated from Hell).
  * **Compulsion:** Automatically performs a Bad Deed when entering **Town** or when other players enter the Greedy's location. Only steals from players/Town that have Dana available. Always steals from Town (which acts as an NPC with unlimited Dana).

## **Spiritual Realms (Waiting Areas)**

If a player is not in the Human Realm, they skip the Morning/Afternoon actions and simply resolve the **Evening** effects until rebirth.

**Player Board Changes:** In spiritual realms, the Life/Dana track is out of play and Life is instead represented by colored hearts placed directly on the Merit slider. Hearts appear from 0 toward your Merit value (Heaven: positive direction, Hell: negative direction). As Merit changes, hearts are added or removed accordingly. Dana plays no role in spiritual realms.

### **Heaven Realm**

* **Entry Condition:** Die with **Positive (+) Merit**.  
* **Status:** You exist in bliss. Take on Teacher status, Life is permanently bound to Merit value.
* **Evening Effect:** -1 Delusion, -1 Merit (Life automatically decreases with Merit).
* **Rebirth:** When Merit/Life reaches 0, reincarnate in the Human Realm as a **Teacher**.

### **Hell Realm**

* **Entry Condition:** Die with **Negative (-) Merit**.  
* **Status:** You exist in suffering. Take on Greedy status, Life is permanently bound to absolute Merit value.
* **Evening Effect:** +1 Delusion, +1 Merit toward 0 (Life automatically adjusts with Merit: Life = |Merit|).
* **Rebirth:** When Merit reaches 0 (Life also 0), reincarnate in the Human Realm as **Greedy**.

## **Death & Reincarnation**

When a player dies in the Human Realm:

1. **Check for Nirvana:** If you have **7 Insight**, you achieve Nirvana and **WIN**.  
2. **Reset Stats:** Dana and Insight are lost (reset to 0). Life resets to 5 and aging track resets (👤 head returns to position 0 with fresh hearts at positions 1-5). Karmic factors Merit and Delusion remain unchanged.
3. **Judge Merit:**  
   * **Positive:** Reincarnate in **Heaven**.  
   * **Negative:** Reincarnate in **Hell**.  
   * **Zero:** Reincarnate immediately in **Human Realm** (Town).