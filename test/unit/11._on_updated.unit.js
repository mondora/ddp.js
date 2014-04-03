describe("The _on_updated private method", function () {

	describe("receives as only argument an object containing the property methods (an array of ids) and", function () {

		it("it should call all of the _onUpdatedCallbacks[id] where id belongs to method", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onUpdatedCallbacks[0] = cb;
			ddp._onUpdatedCallbacks[1] = cb;
			ddp._onUpdatedCallbacks[2] = cb;
			ddp._onUpdatedCallbacks[3] = cb;
			ddp._on_updated(obj);
			cb.callCount.should.equal(4);
		});

		it("it should delete the _onUpdatedCallbacks[id]-s it calls after calling them", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onUpdatedCallbacks[0] = cb;
			ddp._onUpdatedCallbacks[1] = cb;
			ddp._onUpdatedCallbacks[2] = cb;
			ddp._onUpdatedCallbacks[3] = cb;
			ddp._on_updated(obj);
			cb.callCount.should.equal(4);
			_.isUndefined(ddp._onUpdatedCallbacks[0]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[1]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[2]).should.be.true;
			_.isUndefined(ddp._onUpdatedCallbacks[3]).should.be.true;
		});

		it("it should not call _onUpdatedCallbacks[id] if id belongs to method but _onUpdatedCallbacks[id] is undefined", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				methods: ["0", "1", "2", "3", "4"]
			};
			(function () {
				ddp._on_updated(obj);
			}).should.not.throw();
		});

	});

});
