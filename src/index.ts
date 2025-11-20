import { DurableObject } from "cloudflare:workers";

const RESET_INTERVAL_MS = 30 * 60 * 1000; // 30분

export class MyDurableObject extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
	}

	async getCount(): Promise<{ count: number; lastResetTime: number }> {
		const now = Date.now();
		let lastResetTime = await this.ctx.storage.get<number>("lastResetTime");
		
		// 최초 요청이거나 30분이 지났으면 리셋
		if (!lastResetTime || now - lastResetTime >= RESET_INTERVAL_MS) {
			await this.ctx.storage.put("count", 0);
			await this.ctx.storage.put("lastResetTime", now);
			lastResetTime = now;
		}
		
		let count = (await this.ctx.storage.get<number>("count")) || 0;
		await this.ctx.storage.put("count", count + 1);
		return { count, lastResetTime };
	}

	async resetCount(): Promise<void> {
		await this.ctx.storage.put("count", 0);
		await this.ctx.storage.put("lastResetTime", Date.now());
	}
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const sabun = url.searchParams.get("sabun");

		if (!sabun) {
			return new Response(JSON.stringify({ error: "sabun parameter is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" }
			});
		}

		const stub = env.MY_DURABLE_OBJECT.getByName(sabun);

		if (url.pathname === "/get_count" && request.method === "GET") {
			const result = await stub.getCount();
			return new Response(JSON.stringify({ 
				sabun, 
				count: result.count,
				lastResetTime: new Date(result.lastResetTime).toISOString()
			}), {
				headers: { "Content-Type": "application/json" }
			});
		}

		if (url.pathname === "/reset_count" && request.method === "PATCH") {
			await stub.resetCount();
			return new Response(JSON.stringify({ sabun, message: "Count reset to 0" }), {
				headers: { "Content-Type": "application/json" }
			});
		}

		return new Response("Not Found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;

