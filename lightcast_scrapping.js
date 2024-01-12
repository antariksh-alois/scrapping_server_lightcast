const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000; // You can change this port number as needed

app.use(express.json());


app.post('/extractSkills', async (req, res) => {
  try {
    const { text } = req.body;
    
    const browser = await puppeteer.launch({ headless: "new" }); // You may set headless to false for debugging
    const page = await browser.newPage();

    await page.goto('https://lightcast.io/open-skills/resume');

    // Wait for the content-editable area to be ready
    await page.waitForSelector('.DraftEditor-editorContainer [contenteditable="true"]');

    // Input your text into the content-editable area
    await page.type('.DraftEditor-editorContainer [contenteditable="true"]', text);

    // Wait for the skills container to appear
    const skillsContainerSelector = '[data-testid="Skills"]';
    await page.waitForSelector(skillsContainerSelector, { timeout: 20000 }); // Wait for 20 seconds
    await page.waitForTimeout(10000); // 10 seconds

    // Extract skills using CSS selectors
    const skills = await page.$$eval('[data-testid="Skills"] [data-testid^="Skills-"]', elements =>
      elements.map(element => element.innerText)
    );

    console.log('Skills:', skills);

    await browser.close();

    res.json({ skills });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

console.log("end")
