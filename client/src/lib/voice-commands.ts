export interface VoiceCommand {
  pattern: RegExp;
  action: string;
  description: string;
  examples: string[];
}

export const voiceCommands: VoiceCommand[] = [
  {
    pattern: /(.+?)\s*を\s*(\d+)個\s*入荷/i,
    action: 'inbound',
    description: '商品の入荷登録',
    examples: ['商品コード ABC123 を 50個 入荷', 'iPhone14 を 10個 入荷']
  },
  {
    pattern: /(.+?)\s*を\s*(\d+)個\s*出荷/i,
    action: 'outbound',
    description: '商品の出荷登録',
    examples: ['商品 XYZ456 を 20個 出荷', 'Tシャツ を 5個 出荷']
  },
  {
    pattern: /(.+?)\s*の\s*在庫\s*(数|を)\s*確認/i,
    action: 'check_stock',
    description: '在庫数の確認',
    examples: ['商品 DEF789 の在庫数を確認', 'iPhone の在庫確認']
  },
  {
    pattern: /(安全在庫|最小在庫)\s*を\s*下回った\s*商品\s*を?\s*表示/i,
    action: 'show_low_stock',
    description: '在庫不足商品の表示',
    examples: ['安全在庫を下回った商品を表示', '最小在庫を下回った商品表示']
  },
  {
    pattern: /(.+?区域|.+?エリア)\s*の\s*在庫\s*状況\s*を?\s*表示/i,
    action: 'show_area_stock',
    description: '指定エリアの在庫状況表示',
    examples: ['A区域の在庫状況を表示', '冷凍エリアの在庫状況表示']
  },
  {
    pattern: /自動発注\s*状況\s*を?\s*確認/i,
    action: 'check_auto_order',
    description: '自動発注状況の確認',
    examples: ['自動発注状況を確認', '自動発注状況確認']
  }
];

export function parseVoiceCommand(transcript: string): {
  command?: VoiceCommand;
  matches?: RegExpMatchArray;
  action?: string;
  parameters?: any;
} {
  for (const command of voiceCommands) {
    const matches = transcript.match(command.pattern);
    if (matches) {
      const parameters = extractParameters(command.action, matches);
      return {
        command,
        matches,
        action: command.action,
        parameters
      };
    }
  }
  
  return {};
}

function extractParameters(action: string, matches: RegExpMatchArray): any {
  switch (action) {
    case 'inbound':
    case 'outbound':
      return {
        productCode: extractProductCode(matches[1]),
        quantity: parseInt(matches[2])
      };
    
    case 'check_stock':
      return {
        productCode: extractProductCode(matches[1])
      };
    
    case 'show_area_stock':
      return {
        area: matches[1]
      };
    
    default:
      return {};
  }
}

function extractProductCode(input: string): string {
  // Try to extract product code patterns like ABC123, XYZ-456, etc.
  const codePattern = /([A-Z0-9\-]+)/i;
  const match = input.match(codePattern);
  return match ? match[1] : input.trim();
}

export const voiceCommandHelp = {
  categories: [
    {
      title: '入出荷操作',
      commands: [
        '「商品コード ABC123 を 50個 入荷」',
        '「商品 XYZ456 を 20個 出荷」'
      ]
    },
    {
      title: '在庫確認',
      commands: [
        '「商品 DEF789 の在庫数を確認」',
        '「A区域の在庫状況を表示」'
      ]
    },
    {
      title: 'アラート確認',
      commands: [
        '「安全在庫を下回った商品を表示」',
        '「自動発注状況を確認」'
      ]
    }
  ]
};
