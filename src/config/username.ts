export const generateUsername = (): string => {
  const foods = [
    "Apple", "Banana", "Mango", "Orange", "Pineapple", "Strawberry",
    "Taco", "Pizza", "Burger", "Noodle", "Sushi", "Ramen",
    "Donut", "Cookie", "Cake", "Pie", "Brownie", "Pudding",
    "Cheese", "Milk", "Bread", "Butter", "Egg", "Honey",
    "Avocado", "Pasta", "Curry", "Steak", "BBQ", "Fries",
    "Popcorn", "Hotdog", "Salmon", "Shrimp", "Lobster", "Crab",
    "Chocolate", "IceCream", "Yogurt", "Granola", "Oatmeal", "Pancake",
    "Waffle", "Sandwich", "Wrap", "Kebab", "Falafel", "Dumpling"
  ]
  const adjectives = [
    "Spicy", "Sweet", "Savory", "Crispy", "Chewy", "Juicy",
    "Tangy", "Zesty", "Creamy", "Hot", "Cold", "Fresh",
    "Smoky", "Buttery", "Golden", "Sticky", "Fluffy", "Crunchy",
    "Glazed", "Sizzling", "Peppery", "Toasty", "Sugary", "Silky",
    "Tender", "Fizzy", "Melty", "Pickled", "Roasted", "Steamy"
  ]

  const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  const num = Math.floor(Math.random() * 10000)

  return `${rand(adjectives)}${rand(foods)}${num}`
}