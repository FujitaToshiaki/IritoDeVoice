export interface Warehouse {
  /** 倉庫名 */
  name: string;
  /** 現在の在庫数 */
  inventory: number;
}

export interface Transfer {
  /** 出庫元の倉庫 */
  from: string;
  /** 入庫先の倉庫 */
  to: string;
  /** 移動量 */
  quantity: number;
}

export interface SimulationStep {
  /** シミュレーションのステップ番号 */
  step: number;
  /** 各ステップでの倉庫間移動 */
  transfers: Transfer[];
  /** ステップ終了時点の各倉庫の在庫 */
  inventories: Record<string, number>;
}

/**
 * 複数倉庫間の在庫を平均化するシミュレーションを行う。
 * 需要を差し引いた後、在庫が平均より多い倉庫から少ない倉庫へ
 * 在庫を移動させる単純なモデル。
 *
 * @param warehouses 初期倉庫情報
 * @param demand 各ステップで消費される在庫量（倉庫名をキーとするレコード）
 * @param steps シミュレーションするステップ数
 * @returns ステップごとの移動履歴
 */
export function simulateInventoryBalancing(
  warehouses: Warehouse[],
  demand: Record<string, number> = {},
  steps = 1,
): SimulationStep[] {
  const state = warehouses.map(w => ({ ...w }));
  const history: SimulationStep[] = [];

  for (let step = 0; step < steps; step++) {
    // 需要分を差し引く
    for (const w of state) {
      w.inventory -= demand[w.name] ?? 0;
    }

    const total = state.reduce((sum, w) => sum + w.inventory, 0);
    const avg = total / state.length;

    const surplus = state
      .filter(w => w.inventory > avg)
      .map(w => ({ name: w.name, amount: w.inventory - avg }));
    const deficit = state
      .filter(w => w.inventory < avg)
      .map(w => ({ name: w.name, amount: avg - w.inventory }));

    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;

    while (i < surplus.length && j < deficit.length) {
      const from = state.find(w => w.name === surplus[i].name)!;
      const to = state.find(w => w.name === deficit[j].name)!;
      const qty = Math.min(surplus[i].amount, deficit[j].amount);

      from.inventory -= qty;
      to.inventory += qty;

      surplus[i].amount -= qty;
      deficit[j].amount -= qty;

      transfers.push({ from: from.name, to: to.name, quantity: qty });

      if (surplus[i].amount <= 0.0001) i++;
      if (deficit[j].amount <= 0.0001) j++;
    }

    history.push({
      step: step + 1,
      transfers,
      inventories: Object.fromEntries(state.map(w => [w.name, w.inventory])),
    });
  }

  return history;
}

// モジュールが直接実行された場合のサンプル実行
if (import.meta.url === (process?.argv[1] && new URL(`file://${process.argv[1]}`).href)) {
  const result = simulateInventoryBalancing(
    [
      { name: "Tokyo", inventory: 120 },
      { name: "Osaka", inventory: 80 },
      { name: "Fukuoka", inventory: 50 },
    ],
    { Tokyo: 20, Osaka: 10, Fukuoka: 5 },
    3,
  );
  console.log(JSON.stringify(result, null, 2));
}
