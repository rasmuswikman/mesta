import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText, tool } from 'ai';
import * as cheerio from 'cheerio';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const getFinnishDate = (daysOffset = 0) => {
    const now = new Date();
    const finnishTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Helsinki' }));
    finnishTime.setDate(finnishTime.getDate() + daysOffset);
    return `${finnishTime.getFullYear()}/${String(finnishTime.getMonth() + 1).padStart(2, '0')}/${String(finnishTime.getDate()).padStart(2, '0')}`;
  };

  const tools = {
    date: tool({
      description: 'Get the current date in Finnish time zone',
      inputSchema: z.object({}),
      execute: async () => {
        const currentFinnishDate = getFinnishDate(0);
        const finnishDateFormatted = new Date().toLocaleDateString('fi-FI', {
          timeZone: 'Europe/Helsinki',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          weekday: 'long',
        });
        return {
          text: `${finnishDateFormatted} (${currentFinnishDate})`,
        };
      },
    }),
    getLunch: tool({
      description: 'Get lunch recommendations from lunchpaus.fi for Vaasa',
      inputSchema: z.object({
        date: z.string().optional().describe('Date in YYYY/MM/DD format, defaults to tomorrow'),
      }),
      execute: async ({ date }) => {
        try {
          // Default to tomorrow's date if not provided, using Finnish time zone
          const targetDate = date || getFinnishDate(1);

          const url = `https://www.lunchpaus.fi/Vaasa/${targetDate}`;

          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const html = await response.text();
          const $ = cheerio.load(html);

          const restaurants: {
            name: string;
            lunchHours: string;
            address: string;
            mapsUrl: string;
            dishes: { name: string; price: string; allergies: string[] }[];
            hasInfo: boolean;
          }[] = [];

          $('.lunchlist').each((_, element) => {
            const $element = $(element);
            const restaurantName = $element.find('h3').text().trim();
            const lunchInfo = $element.find('.lunchtime').text().trim();

            if (restaurantName) {
              const hasInfo = !lunchInfo.includes('Ingen information');
              const dishes: { name: string; price: string; allergies: string[] }[] = [];

              $element.find('.lunch-block').each((_, dishElement) => {
                const $dish = $(dishElement);
                const dishName = $dish.find('.item-name p.name').text().trim();
                const dishPrice = $dish.find('.lunch-price').text().trim();

                const allergies: string[] = [];
                $dish.find('.item-allergy').each((_, allergyEl) => {
                  const allergy = $(allergyEl).text().trim();
                  if (allergy) allergies.push(allergy);
                });

                if (dishName) {
                  dishes.push({
                    name: dishName,
                    price: dishPrice,
                    allergies: allergies,
                  });
                }
              });

              const addressElement = $element.find('.restaurant-info .address-point');
              const address = addressElement.length > 0 ? addressElement.text().trim() : '';
              const mapsUrl = address
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Vaasa, Finland`)}`
                : '';

              restaurants.push({
                name: restaurantName,
                lunchHours: lunchInfo,
                address: address,
                mapsUrl: mapsUrl,
                dishes: dishes,
                hasInfo: hasInfo,
              });
            }
          });

          if (restaurants.length === 0) {
            return {
              text: `No restaurant data found for ${targetDate}. The website might be unavailable or the date format might be incorrect.`,
            };
          }

          return {
            text: {
              date: targetDate,
              restaurants: restaurants.filter((r) => r.hasInfo),
            },
          };
        } catch (error) {
          console.error('Error scraping lunch data:', error);
          return {
            text: `Sorry, I couldn't fetch the lunch data. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          };
        }
      },
    }),
  };

  const result = streamText({
    model: openai('gpt-5-chat-latest'),
    tools,
    system: `You are a helpful lunch assistant in Vaasa, Finland.
      Use the getLunch tool to provide lunch options when relevant.
      Only suggest a few options (1-3) and keep the response concise.
      Don't use emojis. Speak user language and translate dish names to user language.
      Always say what date you are fetching lunch for. Provide Google Maps
      links for addresses.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(3),
  });

  return result.toUIMessageStreamResponse();
}
