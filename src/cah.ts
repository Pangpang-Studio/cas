import { ref } from 'vue'
import type { Ref } from 'vue'

interface CompactBlackCard {
  text: string
  pick: number
}

interface CompactCardPack {
  white: string[]
  black: CompactBlackCard[]
}

export async function loadPack(): Promise<CompactCardPack> {
  console.log('Loading pack')
  const f = await fetch('/cah-all-compact.json')
  return (await f.json()) as CompactCardPack
}

function xorshift32(seed: number) {
  let x = seed
  return () => {
    x ^= x << 13
    x ^= x >> 17
    x ^= x << 5
    return x < 0 ? -x : x
  }
}

function gen_seed(s: string) {
  let seed = 0
  for (let i = 0; i < s.length; i++) {
    seed ^= seed << 5
    seed ^= s.charCodeAt(i)
  }

  return seed
}

function shuffle<T>(arr: T[], seed: number) {
  const rand = xorshift32(seed)
  let currentIndex = arr.length
  while (currentIndex !== 0) {
    let randomIndex = Math.floor(rand() % currentIndex)
    currentIndex -= 1
    ;[arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ]
  }
  return arr
}

export class Deck {
  shuffledBlacks: CompactBlackCard[]
  shuffledWhites: string[]

  blackIndex: number = 0
  whiteIndex: number

  constructor(
    blacks: CompactBlackCard[],
    whites: string[],
    seed: string,
    totalPlayers: number,
    playerIndex: number
  ) {
    const numberSeed = gen_seed(seed)
    this.shuffledBlacks = shuffle(blacks, numberSeed)
    this.shuffledWhites = shuffle(whites, numberSeed)

    let perPlayerCount = Math.floor(whites.length / totalPlayers)
    let currentPlayerIndex = perPlayerCount * playerIndex
    this.whiteIndex = currentPlayerIndex
  }

  drawBlack(): CompactBlackCard {
    let idx = this.blackIndex
    this.blackIndex += 1
    return this.shuffledBlacks[idx]
  }

  drawWhite(): string {
    let idx = this.whiteIndex
    this.whiteIndex += 1
    let res = this.shuffledWhites[idx]
    console.log(this.whiteIndex, res)
    return res
  }
}

export class Game {
  deck: Deck
  blackCard: Ref<CompactBlackCard>
  whiteCards: Ref<string[]>
  cardsPerPlayer: number

  constructor(deck: Deck, cardsPerPlayer: number) {
    this.deck = deck
    this.blackCard = ref(deck.drawBlack())
    let whiteCards = []
    for (let i = 0; i < cardsPerPlayer; i++) {
      whiteCards.push(deck.drawWhite())
    }
    this.whiteCards = ref(whiteCards)
    this.cardsPerPlayer = cardsPerPlayer
  }

  drawBlack() {
    this.blackCard.value = this.deck.drawBlack()
  }

  submitCards(indices: number[]) {
    console.log(this)
    const oldWhiteCards = this.whiteCards.value
    const newCards: (string | null)[] = oldWhiteCards.slice()
    for (let i of indices) {
      newCards[i] = null
    }
    const newWhiteCards = newCards
      .filter((c) => c !== null)
      .map((c) => c as string)
    while (newWhiteCards.length < this.cardsPerPlayer) {
      newWhiteCards.push(this.deck.drawWhite())
    }
    console.log(newWhiteCards)
    this.whiteCards.value = newWhiteCards
  }
}
