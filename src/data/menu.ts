import type { MenuItem, CategoryInfo, Topping } from '../types';

export const categories: CategoryInfo[] = [
  { id: 'pizza', name: 'Pizza', nameEn: 'Pizza', image: '/media/kat-pizza-300x300.webp' },
  { id: 'pasta', name: 'Pasta', nameEn: 'Pasta', image: '/media/kat-pasta-300x300.webp' },
  { id: 'salat', name: 'Salate', nameEn: 'Salads', image: '/media/kat-salat-2-300x300.webp' },
  { id: 'schiacciatine', name: 'Schiacciatine', nameEn: 'Schiacciatine', image: '/media/kat-schiacciatine-300x300.webp' },
  { id: 'spezialitaeten', name: 'Spezialitäten', nameEn: 'Specialties', image: '/media/kat-spezialit-300x300.webp' },
  { id: 'snacks', name: 'Snacks', nameEn: 'Snacks', image: '/media/kat-snacks-300x300.webp' },
  { id: 'drinks', name: 'Getränke', nameEn: 'Drinks', image: '/media/kat-drink-300x300.webp' },
  { id: 'desserts', name: 'Desserts', nameEn: 'Desserts', image: '/media/kat-dessert-2-300x300.webp' },
  { id: 'mittagsmenu', name: 'Mittagsmenü', nameEn: 'Lunch Menu', image: '/media/kat-mittagmenu-300x300.webp' },
  { id: 'pide', name: 'Pide', nameEn: 'Pide', image: '/media/kat-pide-300x300.webp' },
];

export const toppings: Topping[] = [
  { id: 'extra-cheese', name: 'Extra Käse', nameEn: 'Extra Cheese', price: 2, category: 'cheese' },
  { id: 'mozzarella', name: 'Mozzarella', nameEn: 'Mozzarella', price: 2, category: 'cheese' },
  { id: 'gorgonzola', name: 'Gorgonzola', nameEn: 'Gorgonzola', price: 2.5, category: 'cheese' },
  { id: 'parmesan', name: 'Parmesan', nameEn: 'Parmesan', price: 2, category: 'cheese' },
  { id: 'ham', name: 'Schinken', nameEn: 'Ham', price: 2, category: 'meat' },
  { id: 'salami', name: 'Salami', nameEn: 'Salami', price: 2, category: 'meat' },
  { id: 'pepperoni', name: 'Pepperoni', nameEn: 'Pepperoni', price: 2, category: 'meat' },
  { id: 'bacon', name: 'Speck', nameEn: 'Bacon', price: 2.5, category: 'meat' },
  { id: 'chicken', name: 'Poulet', nameEn: 'Chicken', price: 3, category: 'meat' },
  { id: 'tuna', name: 'Thon', nameEn: 'Tuna', price: 2.5, category: 'meat' },
  { id: 'mushrooms', name: 'Champignons', nameEn: 'Mushrooms', price: 1.5, category: 'vegetable' },
  { id: 'onions', name: 'Zwiebeln', nameEn: 'Onions', price: 1, category: 'vegetable' },
  { id: 'peppers', name: 'Peperoni', nameEn: 'Peppers', price: 1.5, category: 'vegetable' },
  { id: 'olives', name: 'Oliven', nameEn: 'Olives', price: 1.5, category: 'vegetable' },
  { id: 'tomatoes', name: 'Tomaten', nameEn: 'Tomatoes', price: 1.5, category: 'vegetable' },
  { id: 'artichokes', name: 'Artischocken', nameEn: 'Artichokes', price: 2, category: 'vegetable' },
  { id: 'spinach', name: 'Spinat', nameEn: 'Spinach', price: 1.5, category: 'vegetable' },
  { id: 'rucola', name: 'Rucola', nameEn: 'Arugula', price: 1.5, category: 'vegetable' },
  { id: 'jalapenos', name: 'Jalapeños', nameEn: 'Jalapeños', price: 1.5, category: 'vegetable' },
  { id: 'garlic', name: 'Knoblauch', nameEn: 'Garlic', price: 1, category: 'vegetable' },
];

export const menuItems: MenuItem[] = [
  // Pizzas
  { id: 'pizza-margherita', name: 'Pizza Margherita', category: 'pizza', prices: { small: 16, large: 36 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Oregano'] },
  { id: 'pizza-funghi', name: 'Pizza Funghi', category: 'pizza', prices: { small: 18, large: 38 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Champignons', 'Oregano'] },
  { id: 'pizza-prosciutto', name: 'Pizza Prosciutto', category: 'pizza', prices: { small: 18, large: 38 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Schinken', 'Oregano'] },
  { id: 'pizza-cipolla', name: 'Pizza Cipolla', category: 'pizza', prices: { small: 18, large: 38 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Zwiebeln', 'Oregano'] },
  { id: 'pizza-hawaii', name: 'Pizza Hawaii', category: 'pizza', prices: { small: 19, large: 39 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Schinken', 'Ananas'] },
  { id: 'pizza-diavolo', name: 'Pizza Diavolo', category: 'pizza', prices: { small: 21, large: 41 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Salami scharf', 'Peperoni', 'Oregano'] },
  { id: 'pizza-quattro-formaggi', name: 'Pizza Quattro Formaggi', category: 'pizza', prices: { small: 21, large: 41 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Gorgonzola', 'Parmesan', 'Ricotta'] },
  { id: 'pizza-capricciosa', name: 'Pizza Capricciosa', category: 'pizza', prices: { small: 21, large: 41 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Schinken', 'Champignons', 'Artischocken', 'Oliven'] },
  { id: 'pizza-frutti-di-mare', name: 'Pizza Frutti di Mare', category: 'pizza', prices: { small: 21, large: 41 }, customizable: true, ingredients: ['Tomaten', 'Mozzarella', 'Meeresfrüchte'] },
  { id: 'pizza-bufala', name: 'Pizza Bufala', category: 'pizza', prices: { small: 22, large: 43 }, customizable: true, ingredients: ['Tomaten', 'Büffelmozzarella', 'Basilikum', 'Oregano'] },
  { id: 'pizza-build-own', name: 'Eigene Pizza', nameEn: 'Build Your Own', category: 'pizza', prices: { small: 14, large: 32 }, customizable: true, description: 'Starte mit Teig und Tomatensauce, füge deine Lieblingszutaten hinzu', descriptionEn: 'Start with dough and tomato sauce, add your favorite toppings', ingredients: ['Teig', 'Tomatensauce'] },

  // Pasta
  { id: 'pasta-napoli', name: 'Pasta Napoli', category: 'pasta', prices: { regular: 18 }, ingredients: ['Tomatensauce', 'Basilikum'] },
  { id: 'pasta-arrabiata', name: 'Pasta all\'Arrabbiata', category: 'pasta', prices: { regular: 19 }, ingredients: ['Tomatensauce', 'Chili', 'Knoblauch'] },
  { id: 'pasta-carbonara', name: 'Pasta Carbonara', category: 'pasta', prices: { regular: 20 }, ingredients: ['Rahmsauce', 'Speck', 'Ei', 'Parmesan'] },
  { id: 'pasta-pesto', name: 'Pasta Pesto', category: 'pasta', prices: { regular: 19 }, ingredients: ['Basilikumpesto', 'Parmesan'] },
  { id: 'pasta-bolognese', name: 'Lasagne Bolognese', category: 'pasta', prices: { regular: 19 }, ingredients: ['Hackfleisch', 'Tomatensauce', 'Béchamel'] },

  // Salate
  { id: 'salat-gruen', name: 'Grüner Salat', nameEn: 'Green Salad', category: 'salat', prices: { regular: 6 } },
  { id: 'salat-gemischt', name: 'Gemischter Salat', nameEn: 'Mixed Salad', category: 'salat', prices: { regular: 8 } },
  { id: 'salat-griechisch', name: 'Griechischer Salat', nameEn: 'Greek Salad', category: 'salat', prices: { regular: 15 }, ingredients: ['Feta', 'Oliven', 'Tomaten', 'Gurken'] },
  { id: 'salat-caprese', name: 'Caprese', category: 'salat', prices: { regular: 10 }, ingredients: ['Mozzarella', 'Tomaten', 'Basilikum'] },
  { id: 'salat-cobb', name: 'Cobb Salat', nameEn: 'Cobb Salad', category: 'salat', prices: { regular: 15 } },

  // Schiacciatine
  { id: 'schiacciatine-caprese', name: 'Schiacciatine Caprese', category: 'schiacciatine', prices: { regular: 14 } },
  { id: 'schiacciatine-rustica', name: 'Schiacciatine Rustica', category: 'schiacciatine', prices: { regular: 14 } },
  { id: 'schiacciatine-diavola', name: 'Schiacciatine Diavola', category: 'schiacciatine', prices: { regular: 14 } },
  { id: 'schiacciatine-prosciutto', name: 'Schiacciatine Prosciutto', category: 'schiacciatine', prices: { regular: 14 } },

  // Spezialitäten
  { id: 'spez-poulet', name: 'Pouletflügeli (7 Stück)', nameEn: 'Chicken Wings (7 pcs)', category: 'spezialitaeten', prices: { regular: 19 } },
  { id: 'spez-nuggets', name: 'Chicken Nuggets (10 Stück)', nameEn: 'Chicken Nuggets (10 pcs)', category: 'spezialitaeten', prices: { regular: 19 } },
  { id: 'spez-cordon-bleu', name: 'Hausgemachter Cordon Bleu', nameEn: 'Homemade Cordon Bleu', category: 'spezialitaeten', prices: { regular: 18 }, description: 'Schweinefleisch (300g)' },

  // Snacks
  { id: 'snack-pommes', name: 'Pommes Frites', nameEn: 'French Fries', category: 'snacks', prices: { regular: 9 } },
  { id: 'snack-potatoes', name: 'Potatoes', category: 'snacks', prices: { regular: 9 } },
  { id: 'snack-mozzarella-sticks', name: 'Mozzarella Sticks (10 Stück)', nameEn: 'Mozzarella Sticks (10 pcs)', category: 'snacks', prices: { regular: 12 } },
  { id: 'snack-samosa', name: 'Samosa (6 Stück)', nameEn: 'Samosa (6 pcs)', category: 'snacks', prices: { regular: 10 } },

  // Drinks
  { id: 'drink-cola', name: 'Cola / Cola Zero', category: 'drinks', prices: { regular: 4 } },
  { id: 'drink-sprite', name: 'Sprite', category: 'drinks', prices: { regular: 4 } },
  { id: 'drink-fanta', name: 'Fanta', category: 'drinks', prices: { regular: 4 } },
  { id: 'drink-ice-tea', name: 'Ice Tea', category: 'drinks', prices: { regular: 4 } },
  { id: 'drink-red-bull', name: 'Red Bull', category: 'drinks', prices: { regular: 5 } },
  { id: 'drink-beer', name: 'Bier (Heineken / Feldschlösschen)', nameEn: 'Beer (Heineken / Feldschlösschen)', category: 'drinks', prices: { regular: 16 }, description: '0.5l' },
  { id: 'drink-wine-red', name: 'Rotwein (Montepulciano / Chianti)', nameEn: 'Red Wine', category: 'drinks', prices: { regular: 13 }, description: '0.5l' },

  // Desserts
  { id: 'dessert-tiramisu', name: 'Hausgemachte Tiramisu', nameEn: 'Homemade Tiramisu', category: 'desserts', prices: { regular: 8 } },
  { id: 'dessert-tartufo', name: 'Tartufo', category: 'desserts', prices: { regular: 8 } },
  { id: 'dessert-tartufo-limoncello', name: 'Tartufo Limoncello', category: 'desserts', prices: { regular: 8 } },
  { id: 'dessert-tartufo-pistazien', name: 'Tartufo Pistazien', nameEn: 'Tartufo Pistachio', category: 'desserts', prices: { regular: 8 } },
  { id: 'dessert-mousse', name: 'Mousse au Chocolat', category: 'desserts', prices: { regular: 8 } },

  // Mittagsmenü
  { id: 'mittag-menu', name: 'Mittagsmenü', nameEn: 'Lunch Menu', category: 'mittagsmenu', prices: { regular: 20 }, description: '1 Pizza (32cm) + 1 grüner Salat + 1 Cola 33cl', descriptionEn: '1 Pizza (32cm) + 1 green salad + 1 Cola 33cl' },
];
