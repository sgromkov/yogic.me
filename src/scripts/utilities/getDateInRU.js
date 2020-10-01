const MONTHS = {
    '01': 'января',
    '02': 'февраля',
    '03': 'марта',
    '04': 'апреля',
    '05': 'мая',
    '06': 'июня',
    '07': 'июля',
    '08': 'августа',
    '09': 'сентября',
    '10': 'октября',
    '11': 'ноября',
    '12': 'декабря'
};

/**
 * Вернет дату в формате DD-MM-YYYY HH:MM
 * @param {string} str Дата в формате YYYY-MM-DD HH:MM
 * @returns {string} Дата в правильном формате
 */
function getDateInRU(str) {
    const day = str[8] === '0' ? str[9] : str[8] + str[9];
    const monthNumber = str[5] + str[6];
    const month = +monthNumber > 12 ? '' : MONTHS[monthNumber];
    const year = str[0] + str[1] + str[2] + str[3];
    let hours = '';
    let minutes = '';
    let time = '';

    if (str.length >= 15) {
        hours = str[11] + str[12];
        minutes = str[14] + str[15];
        time = `${hours}:${minutes}`;
    }

    const dateInRu = (`${time} ${day} ${month} ${year}`).trim();

    return dateInRu;
}

module.exports = getDateInRU;
