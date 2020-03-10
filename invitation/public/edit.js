/*global Alpaca $ urlBase stringify jsonParser*/

window.renderForm = function renderForm(invitationId, data) {
    $('body').css('cursor', 'progress')
    $('#form1').alpaca('destroy')

    Alpaca.defaultToolbarSticky = true
    $('#form1').alpaca({
        schemaSource: '/schema.json',
        optionsSource: '/options.json',
        data: JSON.parse(data),
        options: {
            fields: {
                tab1: {
                    fields: {
                        KODIKOS_FOREA_EGKRISHS: {
                            dataSource: '/resources/foreisProslisis.json'
                        },
						FOREAS_PLIROMIS: {
                            dataSource: '/resources/foreisProslisis.json'
                        },
                        EIDOS_AJIOLOGHSHS: {
                            dataSource: '/resources/eidiAksiologisis.json'
                        },
                        KATHESTOS_ENISXYSHS_LIST: {
                            items: {
                                fields: {
                                    KATHESTOS_ENISXYSHS: {
                                        dataSource: '/resources/kathestotaEnisxisis.json'
                                    }
                                }
                            }
                        }
                    }
                },
                tab2: {
                    items: {
                        fields: {
                            EP_PERIGRAFH: {
                                dataSource: '/resources/epixeirisiakaProgrammata.json'
                            },
                            AXONAS_PERIGRAFH: {
                                dataSource: '/resources/axonesProteraiotitas.json'
                            },
                            KATHGORIA_PER: {
                                dataSource: '/resources/katigoriesPerifereias.json'
                            },
                            TAMEIO: {
                                dataSource: '/resources/tameia.json'
                            },
                            THEMATIKOI_STOXOI: {
                                dataSource: '/resources/thematikoiStoxoi.json'
                            },
                            EIDIKOI_STOXOI: {
                                dataSource: '/resources/eidikoiStoxoi.json'
                            },
                            EPENDYTIKES_PROTERAIOTHTES: {
                                dataSource: '/resources/ependytikesProteraiothtes.json'
                            }
                        }
                    }
                },
                tab3: {
                    items: {
                        fields: {
                            EIDOS_DEIKTH: {
                                dataSource: '/resources/eidiDeikton.json'
                            },
                            ONOMASIA_DEIKTH: {
                                dataSource: '/resources/deiktes.json'
                            },
                            MONADA_METRHSHS: {
                                dataSource: '/resources/monadesMetrisis.json'
                            }
                        }
                    }
                },
                tab4: {
                    fields: {
                        CODED_DATA_FOR_INVITATION: {
                            fields: {
                                OPSMorfh_Xrhmatodothshs_ID_LIST: {
                                    items: {
                                        fields: {
                                            OPSMorfh_Xrhmatodothshs_ID: {
                                                dataSource: '/resources/morfesXrimatodotisis.json'
                                            }
                                        }
                                    }
                                },
                                OPSEdafikh_Diastash_Typos_ID_LIST: {
                                    items: {
                                        fields: {
                                            OPSEdafikh_Diastash_Typos_ID: {
                                                dataSource: '/resources/edafikesDiastaseisTipoi.json'
                                            }
                                        }
                                    }
                                },
                                OPSEdafikh_Diastash_Mhxanismos_id_LIST: {
                                    items: {
                                        fields: {
                                            OPSEdafikh_Diastash_Mhxanismos_id: {
                                                dataSource: '/resources/edafikesDiastaseisMixanismoi.json'
                                            }
                                        }
                                    }
                                },
                                OPSDeytereyon_stoxos_EKT_ID_LIST: {
                                    items: {
                                        fields: {
                                            OPSDeytereyon_stoxos_EKT_ID: {
                                                dataSource: '/resources/deuteuontesStoxoiEKT.json'
                                            }
                                        }
                                    }
                                },
                                OPSOikonomikh_Drasthriothta_id_LIST: {
                                    items: {
                                        fields: {
                                            OPSOikonomikh_Drasthriothta_id: {
                                                dataSource: '/resources/oikonomikesDrastiriotites.json'
                                            }
                                        }
                                    }
                                },
                                ID_GEO_LIST: {
                                    items: {
                                        fields: {
                                            ID_GEO: {
                                                dataSource: '/resources/geografikesTheseis.json'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                tab5: {
                    fields: {
                        PEDIA_PAREMVASHS_OBJ: {
                            fields: {
                                PEDIA_PAREMVASHS_LIST: {
                                    items: {
                                        fields: {
                                            PEDIA_PAREMVASHS: {
                                                dataSource: '/resources/pediaParemvasis.json'
                                            },
                                            KATHGORIA_PERIFEREIAS: {
                                                dataSource: '/resources/katigoriesPerifereias.json'
                                            },
                                            DHMOSIA_DAPANH: {
                                                events: {
                                                    'change': function () {
                                                        const table = this.top().getControlByPath('tab5/PEDIA_PAREMVASHS_OBJ/PEDIA_PAREMVASHS_LIST').getValue()
                                                        const sum = table.reduce((sum, value) => sum + value.DHMOSIA_DAPANH, 0)
                                                        this.top().getControlByPath('tab5/PEDIA_PAREMVASHS_OBJ/DHMOSIA_DAPANH_TOTAL_OBJ/DHMOSIA_DAPANH_TOTAL').setValue(sum)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                tab6: {
                    fields: {
                        KATHGORIES_DAPANON_OBJ: {
                            fields: {
                                KATHGORIES_DAPANON_LIST: {
                                    events: {
                                        'add': function () {
                                            console.log('The value of this was changed to:')
                                        }
                                    },
                                    items: {
                                        fields: {
                                            KATHGORIA_PERIFEREIAS: {
                                                dataSource: '/resources/katigoriesPerifereias.json'
                                            },
                                            RITRA_EUELIKSIAS: {
                                                dataSource: '/resources/trueFalse.json'
                                            }
                                        }
                                    }
                                }
                            }

                        }
                    }
                }
            }
        },
        postRender: function (control) {
            $('body').css('cursor', 'default')

            var codeControl = control.getControlByPath('compiled')
            var code = codeControl.data
            // codeControl.setValue(JSON.stringify(JSON.parse(code)))//, null, 4))
            codeControl.setValue(stringify(JSON.parse(code), {
                shouldExpand: function (object, level, key) {
                    if (object.val != undefined && object.lab != undefined) return false
                    if (object.edit == '' && object.view == '') return false
                    if (key == 'items') return true
                    if (Array.isArray(object) && typeof object[0] != 'object') return false
                    return true
                }
            }))//, null, 4))
            codeControl.editor.setOptions({
                maxLines: 200,
                autoScrollEditorIntoView: true
            })

            $(window).unbind('keydown').bind('keydown', function (event) {
                if (event.ctrlKey && String.fromCharCode(event.which).toLowerCase() == 's') {
                    $('#commit').click()
                    event.preventDefault()
                }
            })
        },
        view: {
            parent: 'bootstrap-edit-horizontal',
            wizard: {
                title: 'Αξιολόγηση',
                description: 'Please fill things in as you wish',
                validation: false,
                markAllStepsVisited: true,
                hideSubmitButton: true,
                bindings: {
                    'tab1': 1,
                    'tab2': 2,
                    'tab3': 3,
                    'tab4': 4,
                    'tab5': 5,
                    'tab6': 6,
                    'tab7': 7,
                    'tab8': 8,
                    'compiled': 9
                },
                steps: [{
                    title: '1',
                    description: 'Γενικά Στοιχεία Πρόσκλησης'
                },
                {
                    title: '2',
                    description: 'Θεματικοί Στόχοι, Επενδυτικές Προτεραιότητες, Ειδικοί Στόχοι'
                },
                {
                    title: '3',
                    description: 'Προβλεπόμενοι Δείκτες Παρακολούθησης'
                },
                {
                    title: '4',
                    description: 'Ενισχυόμενες Κατηγορίες - Επιπρόσθετα Στοιχεία Πρόσκλησης'
                },
                {
                    title: '5',
                    description: 'Οικονομικά Στοιχεία Πρόσκλησης'
                },
                {
                    title: '6',
                    description: 'Κατηγορίες Δαπανών'
                },
                {
                    title: '7',
                    description: 'Υποβολή'
                },
                {
                    title: '8',
                    description: 'Αξιολόγηση'
                },
                {
                    title: '9',
                    description: 'Κώδικας'
                }
                ]
            }
        }
    })

    var count = 0
    const message = function (text, type, extra) {
        $.notify({
            message: text
        }, extra || {
            type: type,
            placement: {
                align: 'center'
            }
        })
        $('#message-area').prepend(++count + ': ' + text + '\n')
        console.log(text)
    }
    $('#commit').off('click').on('click', function () {
        var value = $('#form1').alpaca('get').getValue()
        if (value === '') {
            return
        }
        try {
            jsonParser.parse(value.compiled, false)
            const val = JSON.parse(value.compiled)
            value.compiled = JSON.stringify(val, null, 0)
        } catch (e) {
            message('Αποτυχία ενημέρωσης (Invalid json in last tab)<br>' + e, 'danger')
            return
        }
        $.ajax({
            url: `${urlBase}invitation/${invitationId}?location=local`,
            type: 'PUT',
            dataType: 'json',
            data: JSON.stringify(value, null, 0),
            contentType: 'application/json',
            cache: false,
            timeout: 5000,
            success: () => message('Η εγγραφή ενημερώθηκε', 'success'),
            error: () => message('Αποτυχία εγγραφής', 'danger')
        })
    })

    $('#advanced-download-link').on('click', function () {
        var value = $('#form1').alpaca('get').getValue()
        $('#submit-content').val(JSON.stringify(value))
    })
}
