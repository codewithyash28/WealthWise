import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        errors = []
        page.on("pageerror", lambda exc: errors.append(f"Uncaught exception: {exc}"))
        page.on("console", lambda msg: errors.append(f"Console {msg.type}: {msg.text}") if msg.type == "error" else None)

        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(5000)  # Wait for splash screen to fade

        # Click through guest login
        await page.click("text=Offline Guest")
        await page.click("text=Boot Sandbox Guest Session")
        await page.wait_for_timeout(2000)

        # Check if we are on onboarding
        if await page.query_selector("text=Select Your Primary Currency"):
            await page.click("text=Indian Rupee")
            await page.fill("input[placeholder='Enter your full name']", "Test User")
            await page.click("text=Complete Elite Setup")
            await page.wait_for_timeout(2000)

        # Skip tutorial
        if await page.query_selector("text=Next Step"):
             for _ in range(5):
                 if await page.query_selector("text=Next Step"):
                     await page.click("text=Next Step")
                     await page.wait_for_timeout(500)

        # Check for errors on Dashboard
        await page.goto("http://localhost:3000/#dashboard")
        await page.wait_for_timeout(2000)

        # Check for errors on Portfolio
        await page.goto("http://localhost:3000/#portfolio")
        await page.wait_for_timeout(2000)

        # Check for errors on Rebalancer
        await page.goto("http://localhost:3000/#rebalancer")
        await page.wait_for_timeout(2000)

        # Check for errors on Debt Payoff
        await page.goto("http://localhost:3000/#debt-payoff")
        await page.wait_for_timeout(2000)

        if errors:
            print("FOUND ERRORS:")
            for err in errors:
                print(err)
        else:
            print("NO ERRORS FOUND")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
