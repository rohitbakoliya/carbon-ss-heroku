import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import formidable from 'formidable';
import { getCarbonURL, getScreenshot, Options } from "./src";
import rateLimit from "express-rate-limit";

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(morgan("dev"));

app.use(
  "/api/",
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 mins
    max: 20
  })
);

const handler = async (
  data: string,
  query?: any
): Promise<Buffer | undefined> => {
  const url = getCarbonURL(data, query as Partial<Options>);
  if (!url) {
    return;
  }

  const imageBuffer = await getScreenshot({ url });
  return imageBuffer;
};

app.post("/api/carbon-ss", (req: Request, res: Response) => {
  const form = new formidable.IncomingForm();

  form.parse(req, async function (err: any, fields: any) {
    if (err) {
      console.error(err.message);
      return res.status(500).send(err.message);
    }

    if (fields.data) {
      const imageBuffer = await handler(fields.data.toString(), req.query);

      if (!imageBuffer) {
        return null;
      }
      // fs.writeFileSync('example.jpg', imageBuffer);
      return res.json({
        image: imageBuffer.toString('base64'),
      });
    }
    return res.status(500).json({error: 'No screenshot generated'});
  });
});

app.listen(PORT, () =>
  console.log(`server is running at http://localhost:${PORT}`)
);
