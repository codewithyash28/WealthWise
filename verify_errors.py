import asyncio
import os
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda exc: errors.append(f"Uncaught exception: {exc}"))
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)

        try:
            print("Navigating to http://localhost:3000...")
            await page.goto("http://localhost:3000", wait_until="networkidle")

            # Wait for splash
            print("Waiting for splash screen...")
            await page.wait_for_timeout(6000)

            # Click Start Learning to get to auth
            print("Clicking Start Learning...")
            start_learning = page.get_by_text("Start Learning")
            await start_learning.wait_for(state="visible", timeout=10000)
            await start_learning.click()

            # Click Offline Guest
            print("Clicking Offline Guest...")
            offline_guest = page.get_by_text("Offline Guest")
            await offline_guest.wait_for(state="visible", timeout=10000)
            await offline_guest.click()

            # Boot Sandbox
            print("Booting Sandbox Guest Session...")
            boot_btn = page.get_by_text("Boot Sandbox Guest Session")
            await boot_btn.wait_for(state="visible", timeout=10000)
            await boot_btn.click()

            await page.wait_for_timeout(2000)

            # Check if we are on onboarding
            if await page.get_by_text("Select Your Primary Currency").is_visible():
                print("Onboarding detected, filling details...")
                await page.get_by_text("Indian Rupee").click()
                await page.get_by_placeholder("Enter your full name").fill("Test User")
                await page.get_by_text("Complete Elite Setup").click()
                await page.wait_for_timeout(2000)

            # Check for errors on Dashboard
            print("Checking Dashboard...")
            await page.goto("http://localhost:3000/#dashboard")
            await page.wait_for_timeout(3000)
            await page.screenshot(path="dashboard.png")

            # Check for errors on Portfolio
            print("Checking Portfolio...")
            await page.goto("http://localhost:3000/#portfolio")
            await page.wait_for_timeout(3000)
            await page.screenshot(path="portfolio.png")

        except Exception as e:
            print(f"Test failed with error: {e}")
            await page.screenshot(path="error.png")
        finally:
            if errors:
                print("FOUND CONSOLE/PAGE ERRORS:")
                for err in errors:
                    print(err)
            else:
                print("NO CONSOLE ERRORS FOUND")
            await browser.close()

if __name__ == "__main__":
    if not os.path.exists("screenshots"):
        os.makedirs("screenshots")
    asyncio.run(run())
