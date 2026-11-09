import { test, expect } from "@playwright/test";
test("catalogue, recherche et favoris persistants", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".card")).toHaveCount(4);
  await page.getByLabel("Rechercher un titre").fill("sintel");
  await expect(page.locator(".card")).toHaveCount(1);
  await page.locator(".card").click();
  await page.locator("#favorite").click();
  await page.getByLabel("Fermer", { exact: true }).click();
  await page.getByRole("button", { name: "Bibliothèque", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await page.reload();
  await page.getByRole("button", { name: "Bibliothèque", exact: true }).click();
  await expect(page.locator(".card")).toContainText("Sintel");
  await page.locator(".card").click();
  await page.locator("#watch").click();
  await expect(page.locator("video")).toHaveAttribute(
    "src",
    /sintel\/trailer.mp4/,
  );
  await page.getByLabel("Fermer", { exact: true }).click();
  expect(errors).toEqual([]);
});
test("mobile, filtres et extensions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Animation", exact: true }).click();
  await expect(page.locator(".card")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "../../work/astral-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Extensions", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ajouter", exact: true }),
  ).toBeDisabled();
});
test("captures ordinateur", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({
    path: "../../work/astral-desktop.png",
    fullPage: true,
  });
});
test("lecture réelle du clip local et reprise", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-open="dream"]').click();
  await page.locator("#watch").click();
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.readyState), {
      timeout: 15000,
    })
    .toBeGreaterThan(0);
  await page.locator("video").evaluate((v) => {
    v.currentTime = 12;
    v.pause();
  });
  await page.getByLabel("Fermer", { exact: true }).click();
  await page.reload();
  await page.locator('.grid [data-open="dream"]').click();
  await expect(page.locator("#watch")).toContainText("Reprendre");
  await page.locator("#watch").click();
  await expect
    .poll(() => page.locator("video").evaluate((v) => v.currentTime), {
      timeout: 15000,
    })
    .toBeGreaterThan(10);
});
