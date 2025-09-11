# Patent Ranker

A production-ready web application that analyzes and ranks up to four patents against a problem statement using the OpenAI API.

## Features

- **Patent Analysis**: Input up to 4 patents with AtomAI metadata and analysis across 6 categories
- **AI-Powered Scoring**: Uses OpenAI to score patents across strategic relevance, technical strength, legal durability, market leverage, freedom to operate, and licensing feasibility
- **Interactive Results**: Sortable table with tooltips, ranking cards, and visual heatmaps
- **State Persistence**: All data automatically saved to localStorage
- **Responsive Design**: Clean, minimal UI built with Tailwind CSS and shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - app works with mock data if not provided)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd atomai_v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file in the root directory
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
```

**Note**: If you don't have an OpenAI API key, the app will still work with deterministic mock data for testing purposes.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Enter Problem Statement**: Describe the problem you're trying to solve in the textarea at the top
2. **Add Patents**: Use the "Add Patent" button to add up to 4 patents
3. **Fill Patent Information**: 
   - Paste AtomAI metadata in the "Basic Info" section
   - Fill in the 6 analysis sections with AtomAI long answers for each category
4. **Analyze**: Click "Analyze Patents" to get AI-powered scores and rankings
5. **Review Results**: View detailed scores, rankings, and visual comparisons

## Scoring System

Patents are scored on a 0-100 scale across six categories:

- **Strategic Relevance** (30%): Alignment with problem statement and application potential
- **Technical Strength** (20%): Quality of technical claims and methods  
- **Legal Durability** (15%): Long-term protection based on family breadth
- **Market Leverage** (15%): Commercial advantages and industry benefits
- **Freedom to Operate** (10%): Design-around possibilities and approach centrality
- **Licensing Feasibility** (10%): Ownership clarity and licensing ease

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **API**: OpenAI GPT-3.5-turbo
- **Validation**: Zod
- **State Management**: React hooks with localStorage persistence

## API Endpoints

### POST /api/score

Analyzes patents and returns scores.

**Request Body:**
```json
{
  "problemStatement": "string",
  "patents": [
    {
      "id": "string",
      "metadata": "string",
      "strategicRelevance": "string",
      "technicalStrength": "string", 
      "legalDurability": "string",
      "marketLeverage": "string",
      "freedomToOperate": "string",
      "licensingFeasibility": "string"
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "string",
      "perCategory": {
        "strategicRelevance": { "score": 0-100, "rationale": "string" },
        "technicalStrength": { "score": 0-100, "rationale": "string" },
        "legalDurability": { "score": 0-100, "rationale": "string" },
        "marketLeverage": { "score": 0-100, "rationale": "string" },
        "freedomToOperate": { "score": 0-100, "rationale": "string" },
        "licensingFeasibility": { "score": 0-100, "rationale": "string" }
      },
      "weightedTotal": 0-100
    }
  ]
}
```

## Building for Production

```bash
npm run build
npm start
```

## Development

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## License

MIT License