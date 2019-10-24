const model = require('./model')
const isEqual = require('lodash.isequal')

const compareColumns = function (stagingColumns, productionColumns) {
    if (!Array.isArray(stagingColumns || !Array.isArray(productionColumns))) { 
        return !isEqual(stagingColumns, productionColumns) ? ['All Columns'] : []
    }

    const notInStaging = productionColumns.filter(col => stagingColumns.findIndex(el => el.name == col.name) > -1)
    if (notInStaging.length > 0) { return false }
    const notInProduction = stagingColumns.filter(col => productionColumns.findIndex(el => el.name == col.name) > -1)
    if (notInProduction.length > 0) { return false }    

    const different = stagingColumns.filter(col => {
        const pColIndex = productionColumns.findIndex(pCol => col.name == pCol.name)
        if (pColIndex < 0) return true

        return isEqual(col, productionColumns[pColIndex])
    })

    return different.map(col => col.name)
}

const compare = function (stagingPool, productionPool, stagingId, productionId) {
    const stagingDataP = model.getJsonData(stagingPool, stagingId)
    const productionDataP = model.getJsonData(productionPool, productionId)
    
    return Promise.all([stagingDataP, productionDataP])
        .then(dataArray => {
            const stagingRecordSet = dataArray[0]
            const productionRecordSet = dataArray[1]
            if (productionRecordSet.length < 1) { return [{1: 'not in production'}] }
            if (stagingRecordSet.length < 1) { return [{1: 'not in staging'}] }
            const stagingJson = JSON.parse(stagingRecordSet[0].jsonData)
            const stagingCompiled = JSON.parse(stagingJson.compiled)
            stagingJson.compiled = undefined
            const productionJson = JSON.parse(productionRecordSet[0].jsonData)
            const productionCompiled = JSON.parse(productionJson.compiled)
            productionJson.compiled = undefined

            const diffKeys = Object.keys(stagingJson)
                .filter(el => !isEqual(stagingJson[el], productionJson[el]))
                .map(key => ({[key]: 'different'}))

            const compileDiffKeys = Object.keys(stagingCompiled).map(key => {
                const staging = stagingCompiled[key]
                const production = productionCompiled[key]
                if (production == undefined) { return {[key]: 'not in production'} }
                const stagingColumns = staging.columns || []
                staging.columns = undefined
                const productionColumns = production.columns || []
                production.columns = undefined
                const columnDiff = compareColumns(stagingColumns, productionColumns)
                if (columnDiff.length > 1) { return {[key]:  columnDiff } }
                if (isEqual(staging, production)) { return }

                return {[key]: 'different'}
            })

            return compileDiffKeys.filter(i => i).concat(diffKeys)
        })
}
module.exports = {
    compare
}