# **Hungry Ghost**

**Hungry Ghost** is a game of karma, reincarnation, and enlightenment. Players traverse multiple lives to purify themselves of Delusion and gain Insight.

### **Objective**

To achieve Nirvana and break the cycle of Samsara. A player wins immediately if they **die while having 7 Insight**.

## **The Board & Stats**

Each player tracks the following on their board:

* **Merit:** Karmic balance (-5 to +5). Starts at 0. Gained through Good Deeds and lost through Bad Deeds. Carries over through reincarnations.
* **Life:** Hearts remaining on the aging track. Your 👤 head starts at position 0 and moves through positions 1-5, removing hearts along the way. When all hearts are gone, you must either extend life with Dana or die. Resets to 5 when reincarnating in the Human Realm, otherwise bound to Merit in spiritual realms.
* **Dana:** Currency / material resource used to perform Good Deeds or extend survival on the aging track. Resets to 0 upon death.
* **Delusion:** Obscurations to clarity. Starts at 30. Must be reduced to 0 before Insight can be gained. Increases in Hell and decreases in Heaven. Carries over through reincarnations.
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

### **2. Evening (Maturation)**

The day ends and the active player matures by choosing one of these options:

**Age:** If there is a heart to the right of your head position, you must remove it and move your head into that position.
**Extend:** If there is a coin to the right of your head position, you may spend 1 Dana to remove the coin and move your head into that position.
**Die:** If there is no heart or coin to the right of your head position, or if you choose not to extend, you must die and proceed to the Death & Reincarnation phase.
**Nirvana:** If there is no heart to the right of your head position, and you have 7 Insight, you may choose to enter Nirvana and win the game immediately. If you have coins available, you may also choose to extend instead.
**Bodhisattva:** If there is no heart to the right of your head position, and you have 7 Insight, you may choose to become a Bodhisattva, foregoing immediate Nirvana to help others achieve enlightenment. Reincarnate in the Human Realm as a Teacher, keeping your current Merit. This is simply a compassionate choice - any player who later achieves 7 Insight can still win by choosing Nirvana.

*Note: The aging track represents your journey through life. You start at position 0 with hearts waiting at positions 1-5. Dana can extend survival but only after all hearts are removed.*

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

**Judge Merit:**
    * **Positive:** Immediately reincarnate in **Heaven**. Dana and Insight are lost, Life fills from 0 up to your merit indicator. Delusion remains unchanged.
    * **Negative:** Immediately reincarnate in **Hell**. Dana and Insight are lost, Life fills from 0 up to your merit indicator. Delusion remains unchanged.
    * **Zero:** Immediately reincarnate in **Human Realm** (Town). Dana and Insight are lost, Life resets to 5 hearts, Delusion remains unchanged.