# **Hungry Ghost**

**Hungry Ghost** is a game of karma, reincarnation, and enlightenment. Players traverse multiple lives to purify themselves of Delusion and gain Insight.

### **Objective**

To break the cycle of Samsara. A player wins immediately if they **die while maximum Insight**.

## **The Board & Stats**

Each player tracks the following on their board:

* **Merit:** Karmic balance (-5 to +5). Starts at 0.  
* **Life:** Turns remaining in the current life. Starts at 5.  
* **Dana:** Currency / material resource used to perform Good Deeds or extend Life.  
* **Delusion:** Obscurations to clarity. Starts at 30. Must be reduced to 0 before Insight can be gained.  
* **Insight:** Spiritual understanding. Gained only after Delusion is cleared. Resets to 0 upon death.

### **Locations (Human Realm)**

* **Cave:** Solitary meditation (High efficiency).  
* **Forest:** Nature meditation (Medium efficiency).  
* **Town:** Social hub for Alms and Deeds.  
* **Temple:** Group meditation and Ordination (becoming a Monk).

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
* **Bad Deed:** Lose **-1 Merit** to steal Dana.  
  * *Restriction:* Must be in Town or sharing a location with another player.  
  * *Effect:* Steal 1 Dana from *every* other player at your location. If in Town, steal an additional +1 Dana from the bank (game box).  
* **Alms:** (Requires **Monk** status). Gain **+1 Dana** from the town.  
  * *Restriction:* Morning phase only. Must be in Town.  
* **Skip:** Pass the time and proceed to the next phase.

### **2. Evening (The Ritual)**

The day ends and the toll of existence is paid.

1. **Life -1.**  
2. **Survival Check:** If Life drops to 0, the player may optionally pay **1 Dana** to not die (extending their life).  
3. **Death:** If Life is 0 and the player cannot or chooses not to pay Dana, they die (see *Reincarnation*).

## **Player States & Passive Effects**

* **Monk:** Gained by visiting the **Temple**. Allows the **Alms** action.  
* **Meditator:** Prerequisite for Meditating. Learned automatically if you end a move in the same location as a **Teacher**.  
* **Teacher:** (Reincarnated from Heaven).  
  * **Compulsion:** Automatically teaches nearby players (making them Meditators) and gains **+1 Merit** per player for doing so.  
* **Greedy:** (Reincarnated from Hell).  
  * **Compulsion:** Automatically performs a Bad Deed (Steal) whenever entering the **Town** or when another player enters their location.

## **Spiritual Realms (Waiting Areas)**

If a player is not in the Human Realm, they skip the Morning/Afternoon actions and simply resolve the **Evening** effects until rebirth.

### **Heaven Realm**

* **Entry Condition:** Die with **Positive (+) Merit**.  
* **Status:** You exist in bliss. Take on Teacher status, Life matches your Merit.
* **Evening Effect:** -1 Delusion, Merit and Life tick down towards 0.  
* **Rebirth:** When Merit / Life hits 0, return to Human Realm as a **Teacher**.

### **Hell Realm**

* **Entry Condition:** Die with **Negative (-) Merit**.  
* **Status:** You exist in suffering. Take on Greedy status, Life matches the absolute value of your Merit.
* **Evening Effect:** +1 Delusion, Merit ticks up towards 0. Life is bound to Karma (Life = absolute value of Merit).  
* **Rebirth:** When Merit / Life hits 0, return to Human Realm as **Greedy**.

## **Death & Reincarnation**

When a player dies in the Human Realm:

1. **Check Win:** If you have **7 Insight**, you break the cycle and **WIN**.  
2. **Reset Stats:** Dana and Insight are lost (reset to 0). Life resets to 5. Karmic factors Merit and Delusion remain unchanged.
3. **Judge Merit:**  
   * **Positive:** Reincarnate in **Heaven**.  
   * **Negative:** Reincarnate in **Hell**.  
   * **Zero:** Reincarnate immediately in **Human Realm** (Town).