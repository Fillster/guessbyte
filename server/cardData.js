export const cardPool = [
    'Elephant', 'Pineapple', 'Rocket', 'Guitar', 'Dragon', 'Mountain',
    'Sushi', 'Soccer Ball', 'Pyramid', 'Cactus', 'Robot', 'Wizard'
];

export function getRandomCards(n = 3) {
    const shuffled = cardPool.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}
