import { SourceResolver } from "./SourceResolver";

export class JsDelivrSourceResolver implements SourceResolver {
	public async resolvePackageJson(packageName: string, version: string | undefined, subPath: string | undefined): Promise<string | undefined> {
		return await this.resolveFile(`https://cdn.jsdelivr.net/npm/${packageName}${version ? `@${version}` : ""}${subPath ? `/${subPath}` : ""}/package.json`);
	}

	public async resolveSourceFile(packageName: string, version: string | undefined, path: string): Promise<string | undefined> {
		return await this.resolveFile(`https://cdn.jsdelivr.net/npm/${packageName}${version ? `@${version}` : ""}/${path}`);
	}

	private async resolveFile(url: string) {
		const res = await fetch(url, { method: "GET" });

		if (res.ok) {
			return await res.text();
		} else if (res.status === 404) {
			return "";
		} else {
			throw Error(`Error other than 404 while fetching from Unpkg at ${url}`);
		}
	}
}
