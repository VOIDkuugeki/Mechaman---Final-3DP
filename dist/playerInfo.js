export class PlayerInfo {

  maxHealth;
  currentHealth;

  constructor() {
    this.maxHealth = 20; // Max HP

    // Set default
    this.currentHealth = this.maxHealth;
  }

  // Functions
  getHealth() {
    return this.currentHealth;
  }

  hit() {
    this.currentHealth--;
  }
}

