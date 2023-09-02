

export function toLocalStringUpToMinute(date: Date):string{
    var dateString = date.toJSON()
    var until = dateString.lastIndexOf(':')
    return dateString.substring(0,until)
}

export function dateStringToDate(str: string):Date{
    return new Date(str+'Z')
}