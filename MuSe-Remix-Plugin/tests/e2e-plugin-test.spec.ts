import { test, expect } from '@playwright/test';
import * as path from "path";
import { readFile } from "fs/promises";


async function createFile(page) {
    const contractDir = './tests/contractToTest';

    const contentContract = await readFile(path.join(contractDir, "SimpleToken.sol"), 'utf-8');
    const contentTest = await readFile(path.join(contractDir, "SimpleToken-brownie.py"), 'utf-8');

    if(!contentContract) throw new Error("File SimpleToken.sol non trovato");
    if(!contentTest) throw new Error("File SimpleToken-brownie.py non trovato");

    await page.waitForTimeout(2000);

    await page.locator('[data-test-id="virtuoso-item-list"]').getByText('tests').click({
        button: 'right'
    });
    await page.getByText('New File').click();
    await page.locator('[data-test-id="virtuoso-item-list"]').getByRole('textbox').fill('SimpleToken_brownie.py');
    await page.locator('[data-test-id="virtuoso-item-list"]').getByRole('textbox').press('Enter');
    await page.locator('.d-block > .monaco-editor > .overflow-guard > .monaco-scrollable-element.editor-scrollable > .lines-content > .view-lines').click();
    await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).fill(contentTest);

    await page.waitForTimeout(2000);

    await page.locator('[data-test-id="virtuoso-item-list"]').getByText('contracts').click();
    await page.locator('[data-test-id="virtuoso-item-list"] span').nth(1).click();
    await page.locator('[data-test-id="virtuoso-item-list"]').getByRole('textbox').fill('SimpleToken.sol');
    await page.locator('[data-test-id="virtuoso-item-list"]').getByRole('textbox').press('Enter');
    await page.locator('.d-block > .monaco-editor > .overflow-guard > .monaco-scrollable-element > .lines-content > .view-lines').click();
    await page.getByRole('textbox', { name: 'Editor content;Press Alt+F1' }).fill(contentContract);

}


async function uploadPlugin(page) {
    await page.getByRole('img', { name: 'pluginManager' }).click();
    await page.getByRole('button', { name: 'pluginManager Connect to an' }).click();
    await page.getByRole('textbox', { name: 'Plugin Name (required)' }).click();
    await page.getByRole('textbox', { name: 'Plugin Name (required)' }).fill('muse');
    await page.getByRole('textbox', { name: 'Display Name' }).click();
    await page.getByRole('textbox', { name: 'Display Name' }).fill('muse');
    await page.getByRole('textbox', { name: 'Url (required)' }).click();
    await page.getByRole('textbox', { name: 'Url (required)' }).fill('https://carmineh.github.io/MuSe-Remix-Plugin/');
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    await page.getByRole('img', { name: 'muse', exact: true }).click();

}
test.beforeEach(async ({page}) => {

await page.context().clearCookies();


    await page.goto('https://remix.ethereum.org/');

    await page.getByRole('button', { name: 'Accept' }).click();

    const cookieBtn = page.getByRole('button', { name: 'Production - only deployments' });
    if (await cookieBtn.isVisible().catch(() => false)) {
        await cookieBtn.click();
    }

});


test("No mutant generated", async ({ page }) => {

    await createFile(page);

    await uploadPlugin(page);

    await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/SimpleToken.sol');

    await page.locator('#plugin-muse').contentFrame().locator('.dropdown__value-container').first().click();

    //TODO selezionare un operatore che non genera mutanti

    await page.locator('#plugin-muse').contentFrame().getByRole('option', { name: 'Enum replacement' }).click();

    await page.locator('#plugin-muse').contentFrame().getByRole('button', { name: 'Mutate' }).click();
    await page.getByRole('checkbox', { name: 'Remember this choice' }).check();
    await page.getByRole('button', { name: 'Accept' }).click();

    await page.waitForTimeout(2000);
    console.log("test 1");
    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("No mutants generated");


});


test('Load plugin in Remix', async ({ page }) => {

    await uploadPlugin(page);

    console.log("test 2");

    const pluginFrame = await page.frameLocator('iframe[src*="carmineh.github.io/MuSe-Remix-Plugin/"]');
    await expect(pluginFrame.locator('body')).toBeVisible();
});

test("Execute mutation", async ({ page }) => {

    await createFile(page);

    await uploadPlugin(page);


    await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/SimpleToken.sol');

    await page.locator('#plugin-muse').contentFrame().locator('.dropdown__control').first().click();
    await page.locator('#plugin-muse').contentFrame().getByRole('option', { name: 'Binary operator replacement' }).click();

    await page.locator('#plugin-muse').contentFrame().getByRole('button', { name: 'Mutate' }).click();
    await page.getByRole('checkbox', { name: 'Remember this choice' }).check();
    await page.getByRole('button', { name: 'Accept' }).click();

    console.log("test 3");

    //expect(page.locator('#plugin-muse').getByText("File saved successfully").isVisible());
    // await expect(page.locator('#plugin-muse').getByText("File saved successfully")).toBeVisible();
    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("File saved successfully");


});

test("No mutant selected", async ({ page }) => {
    await uploadPlugin(page);


    await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/1_Storage.sol');

    //await page.locator('#plugin-muse').contentFrame().locator('.dropdown__control').first().click();
    //await page.locator('#plugin-muse').contentFrame().getByRole('option', { name: 'Binary operator replacement' }).click();

    await page.locator('#plugin-muse').contentFrame().getByRole('button', { name: 'Mutate' }).click();

    console.log("test 4");

    //expect(page.locator('#plugin-muse').getByText("Please select at least one mutation operator").isVisible());
    // await expect(page.locator('#plugin-muse').getByText("Please select at least one mutation operator")).toBeVisible();
    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("Please select at least one mutation operator");

});


test("Test complete successfully", async ({ page }) => {


    await createFile(page);

    await uploadPlugin(page);


    await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/SimpleToken.sol');

    await page.locator('#plugin-muse').contentFrame().locator('div:nth-child(3) > .css-b62m3t-container > .dropdown__control > .dropdown__value-container').click();
    await page.locator('#plugin-muse').contentFrame().getByRole('option', { name: 'Tx origin' }).click();


    await page.locator('#plugin-muse').contentFrame().getByRole('button', { name: 'Mutate' }).click();
    await page.getByRole('checkbox', { name: 'Remember this choice' }).check();
    await page.getByRole('button', { name: 'Accept' }).click();

    // expect(page.locator('#plugin-muse').getByText("File saved successfully").isVisible());

    await page.locator('#plugin-muse').contentFrame().getByText("File saved successfully").waitFor();

    await page.locator('#plugin-muse').contentFrame().getByRole('button', {name: 'Test'}).click();
    await page.locator('#plugin-muse').contentFrame().locator('div').filter({hasText: /^Testing Framework:BrownieHardhatForge \(Foundry\)Truffle$/}).getByRole('combobox').selectOption('brownie');
    await page.locator('#plugin-muse').contentFrame().getByRole('button', {name: 'RUN'}).click();

    await page.waitForTimeout(50000);
/*
    await page.waitForResponse(response =>
        response.url().includes('/api/test') && response.status() === 200
    );
*/
    console.log("test 5");


    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("Report saved");


});


test("No contract selected", async ({ page }) => {
    await uploadPlugin(page);


    //await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/SimpleToken.sol');

    await page.locator('#plugin-muse').contentFrame().getByRole('button', { name: 'Mutate' }).click();
    await page.waitForTimeout(2000);

    console.log("test 6");

    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("Please select a contract first");

});



test("No test file found", async ({ page }) => {

    await uploadPlugin(page);


    await page.locator('#plugin-muse').contentFrame().getByLabel('Select Contract').selectOption('contracts/1_Storage.sol');


    // expect(page.locator('#plugin-muse').getByText("File saved successfully").isVisible());

    //await page.locator('#plugin-muse').contentFrame().getByText("File saved successfully").waitFor();

    await page.locator('#plugin-muse').contentFrame().getByRole('button', {name: 'Test'}).click();
    await page.locator('#plugin-muse').contentFrame().locator('div').filter({hasText: /^Testing Framework:BrownieHardhatForge \(Foundry\)Truffle$/}).getByRole('combobox').selectOption('truffle');
    await page.locator('#plugin-muse').contentFrame().getByRole('button', {name: 'RUN'}).click();


    await page.waitForTimeout(2000);

    console.log("test 7");

    //expect(page.locator('#plugin-muse').getByText("xychbdsh").isVisible());
    //await expect(page.locator('#plugin-muse').getByText("Report saved")).toBeVisible();
    const pluginFrame = page.locator('#plugin-muse').contentFrame();
    const consoleTextarea = pluginFrame.locator('#console');
    const consoleText = await consoleTextarea.inputValue();
    expect(consoleText).toContain("No test files found");


});
