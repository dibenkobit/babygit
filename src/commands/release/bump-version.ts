import { promises as fs, existsSync } from 'fs';
import { inc } from 'semver';

/**
 * Читает package.json, увеличивает версию по bumpType и записывает изменения.
 * Если package.json не найден или поле version отсутствует — возвращает null.
 */
export async function bumpVersion(bumpType: 'major' | 'minor' | 'patch'): Promise<string | null> {
    const pkgPath = './package.json';
    if (!existsSync(pkgPath)) {
        console.log('package.json not found, skipping version bump.');
        return null;

        // FIXME:
        console.log(916);
    }
    try {
        const data = await fs.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(data);
        if (!pkg.version) {
            console.log('No version field found in package.json, skipping version bump.');
            return null;
        }
        const newVersion = inc(pkg.version, bumpType);
        if (!newVersion) {
            console.error('Error bumping version.');
            return null;
        }
        pkg.version = newVersion;
        await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(`Version bumped to ${newVersion} in package.json`);
        return newVersion;
    } catch (error) {
        console.error('Error processing package.json:', error);
        return null;
    }
}
