
import { PuzzleData } from "@/types/puzzle";

export const puzzleData: PuzzleData[] = [
  {
    title: "COFFEE",
    description: "You loved asking the baristas to make cool latte art. There may be more to it than you think. The secret lies in the last 3 sips.",
    hints: [
      "Do you notice something missing with the bottom 3 cups of coffee?",
      "You need to find the correct letters that match the latte art pattern.",
      "Each letter has an associated symbol in the latte art. For example, heart = C.",
      "The first cup with missing letters should have a W on the left side and an A on the right side.",
      "The second cup with missing letters should have an R on the left side and an M on the right side.",
      "The third cup with missing letters should have a T on the left side and an H on the right side. Combine all the letters together to get the answer.",
    ],
    answer: ["WARMTH", "WARM"],
  },
  {
    title: "PIGS",
    description: "There's a secret tucked away where people leave their spare change. Take a look and follow the shapes.",
    hints: [
      "Do you notice the letters on the pigs and symbols on the ground?",
      "The pigs provide the key to help solve the symbols on the ground.",
      "This is called a pigpen cipher. The solution is found by looking at the lines surrounding the letters.",
      "The first footprint is an S.",
      "The letters on the left pig spell STATE. Decipher the rest of the symbols to get the answer."
    ],
    answer: ["STATE FAIR", "STATEFAIR"],
  },
  {
    title: "FISH",
    description: "Fish are always flying at the market. Sometimes they go missing.",
    hints: [
      "Do you notice the letters on the fish pieces and the signs?",
      "This is similar to a crossword puzzle. Use the numbers and arrows on the signs to solve. For example, the top left sign has a 1 and an -> which means it is the word for the first row.",
      "The answers to the signs are CARP (1 across), HOOK (2 across), RINK (3 across), AHI (1 down), POKE (3 down).",
      "Apply the answers to the crossword. Some letters will be missing a fish.",
      "The fish pieces with the missing letters form a word, which is the solution to the puzzle.",
      "In the word CARP, the C does not have a designated fish, so it is part of the solution. Find all other missing letters to get the solution."
      ],
    answer: "CREEK",
  },
  {
    title: "FLOWERS",
    description: "Look closely at the hybrids. If you know what each one is made of, you might figure out which letter to pluck from each name.",
    hints: [
     "Do you notice the flowers and their labels?",
     "There are 4 bouquets with blue labels and 4 bouquets with pink labels. The hybrids have a blue and pink label.",
     "Figure out what plants make up the hybrids.",
     "The hybrid flowers from left to right are PINCUSION + DAHLIA, BLUEBELL + TULIP, SNAPDRAGON + CHOCOLATE COSMOS, and SUNFLOWER + ROSE.",
     "Each bouquet has a different number of flowers in it.",
     "Count the number of flowers in each bouquet and use that to index the correct letter. For example, There are 7 flowers in the Pincushion bouquet, which means you would extract the letter H since it is the 7th letter in Pincushion.",
     "For the first hybrid flower, the letters are H and I. Continue extracting the correct letter from each flower to get the solution."
    ],
    answer: ["HIBISCUS", "HIBICUS"],
  },
  {
    title: "PRODUCE",
    description: "I always loved when vendors at the market would slice open fruit for you. Looks like the oranges and dragon fruit are already cut! With help from the numbers, line by line, something familiar will start to take shape.",
    hints: [
     "Do you notice the cut produce, and numbers on the top, left, and bottom of the produce?",
     "The cut produce (oranges and dragonfruit) show you how to solve the puzzle.",
     "For the top left container with the oranges, the top numbers represent the number of cut fruit in that container column. The left numbers represent the number of cut fruit in that row.",
     "For the oranges, the top numbers are all 2, which means that there are 2 oranges in each column.",
     "Continue this pattern with the other produce to get letters. The cut oranges form a V and the cut dragonfruit form a D.",
     "The top row of letters are V, E, and N. Follow the same patern for the bottom row to get the solution."
    ],
    answer: ["VENDORS", "VENDOR"],
  },
  {
    title: "CHEESE",
    description: "I've noticed something curious on the shelves: no two wheels on the same shelf look exactly alike. Can you spot the pattern?",
    hints: [
     "Do you notice the cheese wheels with different label shapes, patterns, colors, and heights?",
     "The first 6 cheese have a red string connecting some of them together. This is the pattern to follow for the rest of the cheese wheels.",
     "No 2 wheels in each group are exactly the same. The cheese wheels connected together are very similar though.",
     "The cheese wheels that are connected to each other have 3 out of 4 characteristics the same.",
     "Following the pattern of connecting cheese wheels that have 3 out of 4 characteristics the same, you get letters from the connections.",
     "The second shelf gives you the letter I. Follow this pattern for the rest of the letters to get the solution."
    ],
    answer: "RIND",
  },
  {
    title: "POST ALLEY",
    description: "Pay attention to the details, both front and back - they hold the key.",
    hints: [
     "Do you notice a difference between the left and right images?",
     "There are 5 differences between the left and right images.",
     "Once you have found all the differences, take a look at the back of the postcard. Can you extract words using both sides?",
     "Match the differences with the back side. For example, the word behind the crow is THE. Find all the words behind the image differences to get the solution."
    ],
    answer: ["COBBLESTONE", "COBBLE STONE"],
  },
  {
    title: "GUM WALL",
    description: "The gum wall doesn't just hold sugar and stories - it holds perspectives.",
    hints: [
    "There's something interesting with the pink gum of the gum wall.",
    "Can you look at the postcard through a different angle?",
    "Hold the postcard perpendicular to your face to see a message hidden in the gum wall.",
    "The hidden message is THE WORD IS STICKING."
    ],
    answer: ["STICKING", "STICK"],
  },
  {
    title: "FERRIS WHEEL",
    description: "When you start from the beginning, everything becomes clear. The wheel goes round and round, just lie our lives and stories.",
    hints: [
      "Do you notice the ferris wheel with letters, the red arrow, and the patterns on the ferris wheel and boat?",
      "If you start from the arrow pointing at the P, where do you go next?",
      "The boat gives you the pattern to follow, starting from red. The next letter would be A since it is orange.",
      "Keep going until all words in the ferris wheel are used once."
    ],
    answer: ["PANORAMIC VIEWS", "PANORAMIC VIEW", "PANORAMA"],
  },
  {
    title: "THE FINAL LETTER",
    description: "The market changes over time. What are the hands pointing at?",
    hints: [
    "Do you notice the sign with 9 arrows of varying lengths?",
    "Where have you seen those red arrows before?",
    "What has a short hand and a long hand?",
    "The arrows represent the hands of the clocks from all the puzzles you have solved before.",
    "Look at the number the hands of the clocks are pointing at rather than the actual time.",
    "For the first sign (COFFEE), the arrow is short, which represents the hour hand on the clock, which is pointing to a 3. The 3rd letter in WARMTH is R.",
    "Following this pattern for all the puzzles, you get R, E, M, I, N, I, S, C, and E."
    ],
    answer: ["REMINISCE", "REMINISCENCE"],
  }
];
