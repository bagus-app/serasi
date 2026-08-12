/**
 * Sistem bintang doa — data dipisah per klien (namespace),
 * jadi doa tamu Arka tidak bocor ke tamu Putri.
 */

export interface Wish {
  nama: string;
  pesan: string;
}

export class WishStore {
  private key: string;
  private wishes: Wish[] = [];

  constructor(slug: string) {
    this.key = `langit-doa:${slug}`;
    try {
      this.wishes = JSON.parse(localStorage.getItem(this.key) ?? "[]");
    } catch {
      this.wishes = [];
    }
  }

  all(): Wish[] {
    return this.wishes;
  }

  count(): number {
    return this.wishes.length;
  }

  add(wish: Wish): void {
    this.wishes.push(wish);
    while (this.wishes.length > 50) this.wishes.shift();
    localStorage.setItem(this.key, JSON.stringify(this.wishes));
  }

  latest(n: number): Wish[] {
    return this.wishes.slice(-n).reverse();
  }
}