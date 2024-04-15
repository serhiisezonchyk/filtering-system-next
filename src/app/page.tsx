'use client';

import EmptyStateProduct from '@/components/Products/EmptyStateProduct';
import Product from '@/components/Products/Product';
import ProductSceleton from '@/components/Products/ProductSceleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Product as TProduct } from '@/db';
import { cn } from '@/lib/utils';
import { ProductState } from '@/lib/validators/product-validator';
import { useQuery } from '@tanstack/react-query';
import { QueryResult } from '@upstash/vector';
import axios from 'axios';
import debounce from 'lodash.debounce';
import { ChevronDown, Filter } from 'lucide-react';
import { useCallback, useState } from 'react';
const SORT_OPTIONS = [
  { name: 'None', value: 'none' },
  { name: 'Price: Low to high', value: 'price-asc' },
  { name: 'Price: High to low', value: 'price-desc' },
] as const;

const COLOR_FILTERS = {
  id: 'color',
  name: 'Color',
  options: [
    { value: 'white', label: 'White', color: '#f3f3f3' },
    { value: 'beige', label: 'Beige', color: '#c9ae63' },
    { value: 'blue', label: 'Blue', color: '#68b2f2' },
    { value: 'green', label: 'Green', color: '#8fa15c' },
    { value: 'purple', label: 'Purple', color: '#734391' },
  ] as const,
};

const SIZE_FILTERS = {
  id: 'size',
  name: 'Size',
  options: [
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
  ],
} as const;

const PRICE_FILTERS = {
  id: 'price',
  name: 'Price',
  options: [
    { value: [0, 100], label: 'Any price' },
    { value: [0, 20], label: 'Under $20' },
    { value: [0, 40], label: 'Under $40' },
    //custom option in jsx
  ],
} as const;
const SUBCATEGORIES = [
  { name: 'T-Shirts', selected: true, href: '#' },
  { name: 'Hoodies', selected: false, href: '#' },
  { name: 'Sweatshirts', selected: false, href: '#' },
  { name: 'Accessories', selected: false, href: '#' },
  { name: 'T-Shirts', selected: false, href: '#' },
] as const;
const DEFAULT_CUSTOM_PRICE = [0, 100] as [number, number];
export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ['beige', 'blue', 'green', 'purple', 'white'],
    price: { isCustom: false, range: DEFAULT_CUSTOM_PRICE },
    size: ['L', 'M', 'S'],
    sort: 'none',
  });
  const { data: products, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<TProduct>[]>('http://localhost:3000/api/products', {
        filter: {
          sort: filter.sort,
          color: filter.color,
          price: filter.price.range,
          size: filter.size,
        },
      });
      return data;
    },
  });

  /*
   * DEBOUNCE
   */
  const onSubmit = () => refetch();
  const debounceSubmit = debounce(onSubmit, 500);
  const _debounceSubmit = useCallback(debounceSubmit, []);

  const applyArrayFilter = ({
    category,
    value,
  }: {
    category: keyof Omit<typeof filter, 'price' | 'sort'>;
    value: string;
  }) => {
    const isFilterApplied = filter[category].includes(value as never);
    if (isFilterApplied) {
      setFilter((prev) => ({ ...prev, [category]: prev[category].filter((v) => v !== value) }));
    } else {
      setFilter((prev) => ({ ...prev, [category]: [...prev[category], value] }));
    }
    _debounceSubmit();
  };
  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24">
        <h1 className=" text-4xl font-bold tracking-tight text-gray-900">High-quality cotton selection</h1>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
              Sort
              <ChevronDown className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-700" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.name}
                  onClick={() => {
                    setFilter((prev) => ({ ...prev, sort: option.value }));
                    _debounceSubmit();
                  }}
                  className={cn('text-left w-full block px-4 py-2 text-sm', {
                    'text-gray-900 bg-gray-100': option.value === filter.sort,
                    'text-gray-500': option.value !== filter.sort,
                  })}
                >
                  {option.name}
                </button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <button className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Filters */}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900">
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button disabled={!category.selected} className="disabled:cursor-not-allowed disabled:opacity-60">
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type="multiple" className="animate-none">
              {/* Color filter */}
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:gray-text-gray-500">
                  <span className="font-medium text-gray-900">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTERS.options.map((option, index) => (
                      <li key={option.value} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${index}`}
                          onChange={() => {
                            applyArrayFilter({ category: 'color', value: option.value });
                          }}
                          checked={filter.color.includes(option.value)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`color-${index}`}
                          className="ml-3 text-sm text-gray-600 flex flex-row gap-2 items-center"
                        >
                          <span className={`flex size-3 bg-[${option.color}] rounded-full`}></span>
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Size filter */}
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:gray-text-gray-500">
                  <span className="font-medium text-gray-900">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTERS.options.map((option, index) => (
                      <li key={option.label} className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${index}`}
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [...option.value],
                              },
                            }));
                            _debounceSubmit();
                          }}
                          checked={
                            !filter.price.isCustom &&
                            filter.price.range[0] === option.value[0] &&
                            filter.price.range[1] === option.value[1]
                          }
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${index}`}
                          className="ml-3 text-sm text-gray-600 flex flex-row gap-2 items-center"
                        >
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className="flex justify-center flex-col gap-2">
                      <div className='flex'>
                        <input
                          type="radio"
                          id={`price-${PRICE_FILTERS.options.length}`}
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));
                            _debounceSubmit();
                          }}
                          checked={filter.price.isCustom}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label
                          htmlFor={`price-${PRICE_FILTERS.options.length}`}
                          className="ml-3 text-sm text-gray-600 flex flex-row gap-2 items-center"
                        >
                          Custom
                        </label>
                      </div>
                      <div className="flex justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          {filter.price.isCustom ? minPrice.toFixed(0) : filter.price.range[0].toFixed(0)}$ -{' '}
                          {filter.price.isCustom ? maxPrice.toFixed(0) : filter.price.range[1].toFixed(0)}$
                        </div>
                      </div>
                      <Slider
                        className={cn({ 'opacity-50': !filter.price.isCustom })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(range) => {
                          const [newMin, newMax] = range;
                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));
                          _debounceSubmit();
                        }}
                        value={filter.price.isCustom ? filter.price.range : DEFAULT_CUSTOM_PRICE}
                        min={DEFAULT_CUSTOM_PRICE[0]}
                        defaultValue={DEFAULT_CUSTOM_PRICE}
                        max={DEFAULT_CUSTOM_PRICE[1]}
                        step={5}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/*Products */}
          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products && products.length === 0 ? (
              <EmptyStateProduct />
            ) : products ? (
              products.map((product) => <Product key={product.id} product={product.metadata!} />)
            ) : (
              new Array(12).fill(null).map((_, i) => <ProductSceleton key={i} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
