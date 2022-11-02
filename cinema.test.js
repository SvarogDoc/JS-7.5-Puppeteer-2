const {
  selectDateTime,
  orderTickets,
  checkSeatIsTaken,
} = require("./lib/util.js");
const { getText } = require("./lib/commands");

let page;
let tomorrow = "nav.page-nav > a:nth-child(2)"; // Билеты на завтра
let oneWeek = "nav.page-nav > a:nth-child(7)"; // Билеты через неделю
let movieTime = "[data-seance-id='94']"; // 14:00, Hercules
let ticketHint = "p.ticket__hint";
let confirmingText =
  "Покажите QR-код нашему контроллеру для подтверждения бронирования.";

describe("Service for Movie tickets order", () => {
  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto("http://qamid.tmweb.ru/client/index.php");
    await page.setDefaultNavigationTimeout(0);
  });

  afterEach(() => {
    page.close();
  });

  test("Should order one ticket for Movie-1 tomorrow", async () => {
    await selectDateTime(page, tomorrow, movieTime);
    await orderTickets(page, 1, 2);
    const actual = await getText(page, ticketHint);
    expect(actual).toContain(confirmingText);
  });

  test("Should order three tickets for Movie-1 in a week", async () => {
    await selectDateTime(page, oneWeek, movieTime);
    await orderTickets(page, 1, 8, 9, 10);
    const actual = await getText(page, ticketHint);
    expect(actual).toContain(confirmingText);
  });

  test("Should try to order ticket for Movie-1 if seat is taken already", async () => {
    await expect(async () => {
      await selectDateTime(page, tomorrow, movieTime);
      await orderTickets(page, 1, 2);
    }).rejects.toThrowError("Seat(s) is taken");
  });

  test("Check if the place is taken after ordering ", async () => {
    let row = 3;
    let seat = 10;
    await selectDateTime(page, oneWeek, movieTime);
    await orderTickets(page, row, seat);
    await page.goto("http://qamid.tmweb.ru/client/index.php");
    await selectDateTime(page, oneWeek, movieTime);
    await checkSeatIsTaken(page, row, seat);
    const classExist = await page.$eval(
      `div.buying-scheme__wrapper > div:nth-child(${row}) > span:nth-child(${seat})`,
      (el) => el.classList.contains("buying-scheme__chair_taken")
    );
    expect(classExist).toEqual(true);
  });
});
