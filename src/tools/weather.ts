import type { ToolCall } from "../llm/types";

const weatherDB: Record<string, { temp: number; condition: string }> = {
   mumbai: { temp: 28, condition: "sunny" },
   delhi: { temp: 32, condition: "hazy" },
   bangalore: { temp: 22, condition: "cloudy" },
   pune: { temp: 26, condition: "partly cloudy" },
   kolkata: { temp: 30, condition: "humid" },
   chennai: { temp: 33, condition: "hot and humid" },
}


export function executeWeatherTool(toolCall: ToolCall): string  {
  const city = toolCall.function.arguments.city.toLowerCase();
  const data = weatherDB[city];

  if (!data) {
    return `No weather data available for ${city}`
  }

  return `${city}: ${data.temp}°C, ${data.condition}`;
}
