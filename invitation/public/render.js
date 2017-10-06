/*global Alpaca $ budgetRules*/

$(document).ready(function() {
    $('body').css('cursor', 'progress');
    const invitationID = $('#invitation-id').val();

    Alpaca.defaultToolbarSticky = true;

    $("#form1").alpaca({
        schemaSource: "/schema.json",
        optionsSource: "/options.json",
        options: {
            fields: {
                tab5: {
                    fields: {
                        PEDIA_PAREMVASHS_OBJ: {
                            fields: {
                                PEDIA_PAREMVASHS_LIST: {
                                    items: {
                                        fields: {
                                            DHMOSIA_DAPANH: {
                                                events: {
                                                    change: function (a) {
                                                        const table = this.top().getControlByPath('tab5/PEDIA_PAREMVASHS_OBJ/PEDIA_PAREMVASHS_LIST').getValue()
                                                        const sum = table.reduce((sum, value) => sum + value.DHMOSIA_DAPANH, 0);
                                                        this.top().getControlByPath('tab5/INVITATION_TOTAL_AMOUNTS/SYNOLO_DD').setValue(sum);
                                                    }
                                                }
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
        dataSource: "/invitation/" + invitationID,
        postRender: function (control) {
            $('body').css('cursor', 'default');
        },
        view: {
            parent: "bootstrap-edit-horizontal",
            wizard: {
                title: "Αξιολόγηση",
                description: "Please fill things in as you wish",
                validation: false,
                markAllStepsVisited: true,
				hideSubmitButton: true,
                bindings: {
                    "tab1": 1,
                    "tab2": 2,
                    "tab3": 3,
                    "tab4": 4,
                    "tab5": 5
                },
                steps: [{
                    title: "1",
                    description: "Γενικά Στοιχεία Πρόσκλησης"
                }, {
                    title: "2",
                    description: "Θεματικοί Στόχοι, Επενδυτικές Προτεραιότητες, Ειδικοί Στόχοι"
                }, {
                    title: "3",
                    description: "Προβλεπόμενοι Δείκτες Παρακολούθησης"
                }, {
                    title: "4",
                    description: "Ενισχυόμενες Κατηγορίες - Επιπρόσθετα Στοιχεία Πρόσκλησης",
                }, {
                    title: "5",
                    description: "Οικονομικά Στοιχεία Πρόσκλησης"
                }]
            }
        }
    });

    $("#commit").on('click', function() {
        var value = $("#form1").alpaca('get').getValue();
        if (value === "") {
            return
        }
        $.ajax({
            url: "/invitation/" + invitationID,
            type: "POST",
            dataType: "json",
            data: JSON.stringify(value),
            contentType: "application/json",
            cache: false,
            timeout: 5000,
            complete: function() {
                console.log('process complete');
                // location.reload();
            },
            success: function(data) {
                console.log(data);
                console.log('process sucess');
            },
            error: function() {
                console.log('process error');
            }
        });
    });

    $('#advanced-download-link').on('click', function() {
        var value = $("#form1").alpaca('get').getValue();
        $('#submit-content').val(JSON.stringify(value));
    });
});
