/////////////////////////
//  Zachytávání chyb  //
///////////////////////

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function chyba(error) {
    if(global.options.debug) {
        console.error(`MarkO: program na vytváření volebních map\nVýpis posledního chybového hlášení (${Date()}):\n${error}`);
    }
}

module.exports = {AppError, chyba}