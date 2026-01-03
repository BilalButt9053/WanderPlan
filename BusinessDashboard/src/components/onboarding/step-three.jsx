import { useState } from 'react';
import { Card } from '../ui/card';
import { Hotel, UtensilsCrossed, MapPin, Check } from 'lucide-react';

const categories = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: UtensilsCrossed,
    description: 'Cafes, bars, dining establishments',
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: Hotel,
    description: 'Hotels, resorts, accommodations',
  },
  {
    id: 'attraction',
    name: 'Attraction',
    icon: MapPin,
    description: 'Tours, activities, landmarks',
  },
];

export function OnboardingStepThree({ formData, updateFormData }) {
  const handleSelect = (categoryId) => {
    updateFormData({ category: categoryId });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Select Category</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the category that best describes your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = formData.category === category.id;

          return (
            <Card
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className={`p-6 cursor-pointer transition-all hover:border-primary relative ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}

              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      isSelected ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
