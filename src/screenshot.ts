import puppeteer from 'puppeteer';

const exePath =
  process.platform === 'win32'
    ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

interface PuppeteerOptions {
  args: string[];
  executablePath?: string;
  defaultViewport?: any;
  headless: boolean;
}

export const getOptions = async (): Promise<PuppeteerOptions> => {
  // use one of the local
  if (process.env.NODE_ENV === 'development') {
    return {
      args: [],
      executablePath: exePath,
      headless: true,
    };
  }
  // for heroku
  return {
    headless: true,
    defaultViewport: null,
    args: ['--incognito', '--no-sandbox', '--single-process', '--no-zygote'],
  };
};

type ScreenshotOptions = {
  url: string;
};

export const getScreenshot = async ({
  url,
}: ScreenshotOptions): Promise<Buffer> => {
  const options = await getOptions();
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();

  /**
   * Here we set the viewport manually to a big resolution
   * to ensure the target,i.e. our code snippet image is visible
   */
  await page.setViewport({
    width: 2560,
    height: 1080,
    deviceScaleFactor: 2,
  });

  /**
   * Navigate to the url generated by getCarbonUrl
   */
  await page.goto(url, { waitUntil: 'load' });

  const exportContainer = await page.waitForSelector('#export-container');
  const elementBounds = await (exportContainer as any).boundingBox();

  if (!elementBounds)
    throw new Error('Cannot get export container bounding box');

  const buffer = await (exportContainer as any).screenshot({
    encoding: 'binary',
    clip: {
      ...elementBounds,
      x: Math.round(elementBounds.x),
      height: Math.round(elementBounds.height) - 1,
    },
  });

  return buffer;
};
