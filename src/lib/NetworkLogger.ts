import type { Page, Request, Response } from '@playwright/test';

const API_RESOURCE_TYPES = new Set(['fetch', 'xhr']);

type RequestTransaction = {
  method: string;
  url: string;
  requestHeaders: Record<string, string>;
  requestPayload: string;
};

type ResponseTransaction = RequestTransaction & {
  responseStatus: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
};

function formatBody(body: unknown): string {
  if (body === undefined || body === null || body === '') {
    return 'N/A';
  }

  if (typeof body === 'string') {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  }

  return JSON.stringify(body, null, 2);
}

async function getRequestPayload(request: Request): Promise<string> {
  const postData = request.postData();

  if (!postData) {
    return 'N/A';
  }

  try {
    return JSON.stringify(request.postDataJSON(), null, 2);
  } catch {
    return formatBody(postData);
  }
}

async function getResponsePayload(response: Response): Promise<string> {
  const headers = await response.allHeaders();
  const contentType = headers['content-type'] || '';

  try {
    if (
      contentType.includes('application/json') ||
      contentType.includes('+json')
    ) {
      return formatBody(await response.json());
    }

    if (
      contentType.startsWith('text/') ||
      contentType.includes('javascript') ||
      contentType.includes('xml')
    ) {
      return formatBody(await response.text());
    }

    const body = await response.body();
    return `<binary response: ${body.length} bytes>`;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown response read error';
    return `<unable to read response: ${message}>`;
  }
}

function logApiTransaction(
  transaction: ResponseTransaction,
  testName?: string,
): void {
  const prefix = testName ? `[${testName}] ` : '';

  console.log(`\n${prefix}========== API CALL ==========`);
  //   console.log(`${prefix}Request Method: ${transaction.method}`);
  console.log(`Request URL: ${transaction.url}`);
  //   console.log(`Request Headers:`, transaction.requestHeaders);
  console.log(`Request Payload:`, transaction.requestPayload);
  console.log(`Response Status: ${transaction.responseStatus}`);
  //   console.log(`Response Headers:`, transaction.responseHeaders);
  console.log(`Response Body:`, transaction.responseBody);
  console.log(`==============================\n`);
}

function logApiFailure(
  request: Request,
  requestDetails: RequestTransaction | undefined,
  testName?: string,
): void {
  const prefix = testName ? `[${testName}] ` : '';

  console.log(`\n${prefix}========== API FAILED ==========`);
  console.log(`${prefix}Request Method: ${request.method()}`);
  console.log(`${prefix}Request URL: ${request.url()}`);
  console.log(
    `${prefix}Request Headers:`,
    requestDetails?.requestHeaders ?? {},
  );
  console.log(
    `${prefix}Request Payload:`,
    requestDetails?.requestPayload ?? 'N/A',
  );
  console.log(
    `${prefix}Failure:`,
    request.failure()?.errorText ?? 'Unknown error',
  );
  console.log(`${prefix}===============================\n`);
}

export function attachApiLogger(page: Page, testName?: string): void {
  const requestStore = new Map<Request, RequestTransaction>();

  page.on('request', async (request: Request) => {
    if (!API_RESOURCE_TYPES.has(request.resourceType())) {
      return;
    }

    requestStore.set(request, {
      method: request.method(),
      url: request.url(),
      requestHeaders: await request.allHeaders(),
      requestPayload: await getRequestPayload(request),
    });
  });

  page.on('response', async (response: Response) => {
    const request = response.request();

    if (!API_RESOURCE_TYPES.has(request.resourceType())) {
      return;
    }

    const requestDetails = requestStore.get(request) || {
      method: request.method(),
      url: request.url(),
      requestHeaders: await request.allHeaders(),
      requestPayload: await getRequestPayload(request),
    };

    logApiTransaction(
      {
        ...requestDetails,
        responseStatus: response.status(),
        responseHeaders: await response.allHeaders(),
        responseBody: await getResponsePayload(response),
      },
      testName,
    );

    requestStore.delete(request);
  });

  page.on('requestfailed', (request: Request) => {
    if (!API_RESOURCE_TYPES.has(request.resourceType())) {
      return;
    }

    const requestDetails = requestStore.get(request);
    logApiFailure(request, requestDetails, testName);
    requestStore.delete(request);
  });
}

export class NetworkLogger {
  static attach(page: Page, testName?: string): void {
    attachApiLogger(page, testName);
  }
}
