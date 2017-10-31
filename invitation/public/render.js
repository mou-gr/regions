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
            tab1: {
              fields: {
                KODIKOS_FOREA_EGKRISHS: {
                  dataSource: '/foreisProslisis.json'
                }

              }
            },
            tab2: {
              items: {
                fields: {
                  EP_PERIGRAFH: {
                    dataSource: '/epixeirisiakaProgrammata.json'
                  },
                  TAMEIO: {
                    dataSource: '/tameia.json'
                  },
                  THEMATIKOI_STOXOI: {
                    dataSource: '/thematikoiStoxoi.json'
                  },
                  EIDIKOI_STOXOI: {
                    dataSource: '/eidikoiStoxoi.json'
                  },
                  EPENDYTIKES_PROTERAIOTHTES: {
                    dataSource: '/ependytikesProteraiothtes.json'
                  }
                }
              }
            },
            tab3: {
              items: {
                fields: {
                  EIDOS_DEIKTH: {
                    dataSource: '/eidiDeikton.json'
                  },
                  EP_PERIGRAFH: {
                    dataSource: '/epixeirisiakaProgrammata.json'
                  },
                  TAMEIO: {
                    dataSource: '/tameia.json'
                  },
                  EPENDYTIKES_PROTERAIOTHTES: {
                    dataSource: '/ependytikesProteraiothtes.json'
                  },
                  ONOMASIA_DEIKTH: {
                    dataSource: '/deiktes.json'
                  }
                }
              }
            },
            tab4: {
              fields: {
                CODED_DATA_FOR_INVITATION: {
                  fields: {
                    OPSMorfh_Xrhmatodothshs_ID: {
                      dataSource: '/morfesXrimatodotisis.json'
                    },
                    OPSEdafikh_Diastash_Typos_ID: {
                      dataSource: '/edafikesDiastaseisTipoi.json'
                    },
                    OPSEdafikh_Diastash_Mhxanismos_id: {
                      dataSource: '/edafikesDiastaseisMixanismoi.json'
                    },
                    OPSDeytereyon_stoxos_EKT_ID: {
                      dataSource: '/deuteuontesStoxoiEKT.json'
                    },
                    OPSOikonomikh_Drasthriothta_id: {
                      dataSource: '/oikonomikesDrastiriotites.json'
                    },
                    ID_GEO: {
                      dataSource: '/geografikesTheseis.json'
                    },
                    KAD_NACE_LIST: {
                      items: {
                        fields: {
                          KAD_NACE: {
                            dataSource: '/kad.json'
                          }
                        }
                      }
                    },
                    EIDOS_EPENDYSH_ID: {
                      dataSource: '/eidiEpendiseon.json'
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
                            dataSource: '/pediaParemvasis.json'
                          },
                          DHMOSIA_DAPANH: {
                            events: {
                              'change': function(a) {
                                const table = this.top().getControlByPath('tab5/PEDIA_PAREMVASHS_OBJ/PEDIA_PAREMVASHS_LIST').getValue()
                                const sum = table.reduce((sum, value) => sum + value.DHMOSIA_DAPANH, 0);
                                this.top().getControlByPath('tab5/PEDIA_PAREMVASHS_OBJ/DHMOSIA_DAPANH_TOTAL_OBJ/DHMOSIA_DAPANH_TOTAL').setValue(sum);
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
                  // fields: {
                    // KATHGORIES_DAPANON_LIST: {
                      events: {
                        'add': function() {
                      console.log("The value of this was changed to:");
                      // var my_object = control.getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST');
                      // var data = my_object.getValue();
                      // control.getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST['+ (data.length - 1) +']/AA').setValue(data.length);
                      // console.log("The value of this was changed to:");
                    }
                  }
                // }

                    //  items: {
                    //     fields: {
                    //     AA: {
                    //         events: {
                    //           'change': function() {
                    //             console.log("The value of this was changed to: ");
                    //             //  this.top().getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST/ELAXISTO_POSOSTO_EPI_TOY_PROIPOLOGISMOY').setValue(sum);
                     //
                    //           }
                    //         }
                    //       }
                    //     }
                    //   }



                }
              }
            }

          }
        },
        dataSource: "/invitation/" + invitationID,
        postRender: function (control) {
            $('body').css('cursor', 'default');
            control.getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST').on('add', function() {

                var my_object = control.getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST');
                var data = my_object.getValue();
                control.getControlByPath('tab6/KATHGORIES_DAPANON_OBJ/KATHGORIES_DAPANON_LIST['+ (data.length - 1) +']/AA').setValue(data.length);
                console.log("The value of this was changed to:");
            })
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
                    "tab5": 5, 
                    "tab6": 6, 
                    "tab7": 7
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
                }, {
                  title: "6",
                  description: "Κατηγορίες Δαπανών"
                }, {
                  title: "7",
                  description: "Υποβολή"
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
